import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatAgeLabel, getAgeInMonths } from '@/lib/childAge';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type InsightRequestBody = {
  observation?: string;
};

type ChildRow = {
  id: string;
  user_id: string;
  name: string;
  birthdate: string;
};

type ProfileRow = {
  user_id: string;
  parent_name: string;
};

let systemPromptCache: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (systemPromptCache) {
    return systemPromptCache;
  }

  const promptPath = path.join(process.cwd(), '..', 'docs', 'prompts', 'system_prompt_master.md');
  const fileContent = await readFile(promptPath, 'utf8');
  systemPromptCache = fileContent;
  return fileContent;
}

function buildPromptContext(params: {
  promptTemplate: string;
  parentName: string;
  childName: string;
  childAgeMonths: number;
  childAgeLabel: string;
  recentObservations: string[];
}): string {
  const { promptTemplate, parentName, childName, childAgeMonths, childAgeLabel, recentObservations } = params;

  return promptTemplate
    .replaceAll('{{parent_name}}', parentName)
    .replaceAll('{{child_name}}', childName)
    .replaceAll('{{child_age_months}}', `${childAgeMonths}`)
    .replaceAll('{{child_age_label}}', childAgeLabel)
    .replaceAll('{{recent_observations}}', recentObservations.join('\n- '))
    .replaceAll('{{output_format}}', 'text');
}

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as InsightRequestBody;
    const observationText = body.observation?.trim();

    if (!observationText) {
      return NextResponse.json({ error: 'Observación vacía.' }, { status: 400 });
    }

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [{ data: profile }, { data: child }] = await Promise.all([
      db.from('profiles').select('user_id,parent_name').eq('user_id', user.id).maybeSingle<ProfileRow>(),
      db
        .from('children')
        .select('id,user_id,name,birthdate')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle<ChildRow>(),
    ]);

    if (!profile || !child) {
      return NextResponse.json({ error: 'Debes completar onboarding primero.' }, { status: 400 });
    }

    const { data: recentObservationRows } = await db
      .from('observations')
      .select('text')
      .eq('user_id', user.id)
      .eq('child_id', child.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const recentObservations = (recentObservationRows ?? [])
      .map((row) => row.text)
      .filter((value): value is string => typeof value === 'string' && value.length > 0);

    const { data: observationRow, error: observationError } = await db
      .from('observations')
      .insert({
        user_id: user.id,
        child_id: child.id,
        text: observationText,
        observation_text: observationText,
        created_by: user.id,
      })
      .select('id')
      .single<{ id: string }>();

    if (observationError || !observationRow) {
      return NextResponse.json({ error: `Error guardando observación: ${observationError?.message}` }, { status: 500 });
    }

    const childAgeMonths = getAgeInMonths(child.birthdate);
    const childAgeLabel = formatAgeLabel(childAgeMonths);

    const promptTemplate = await getSystemPrompt();
    const systemPrompt = buildPromptContext({
      promptTemplate,
      parentName: profile.parent_name,
      childName: child.name,
      childAgeMonths,
      childAgeLabel,
      recentObservations,
    });

    const userPrompt = [
      `Observación de hoy sobre ${child.name}:`,
      observationText,
      '',
      'Responde en español para el padre/madre, con tono cálido, práctico y sin lenguaje clínico.',
      'Incluye celebración, explicación, actividad concreta, versión rápida y una pregunta para seguir observando.',
    ].join('\n');

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const anthropicStream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 900,
      temperature: 0.4,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const textChunk = event.delta.text;
              fullResponse += textChunk;
              controller.enqueue(encoder.encode(textChunk));
            }
          }

          const { error: insightError } = await db.from('insights').insert({
            observation_id: observationRow.id,
            content: fullResponse,
            insight_text: fullResponse,
            json_response: {
              source: 'claude_stream',
            },
            schema_detected: null,
            domain: null,
          });

          if (insightError) {
            controller.error(new Error(`Error guardando insight: ${insightError.message}`));
            return;
          }

          controller.close();
        } catch (streamError) {
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
