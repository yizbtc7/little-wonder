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

type InsightPayload = {
  title: string;
  revelation: string;
  brain_science_gem: string;
  activity: {
    main: string;
    express: string;
  };
  observe_next: string;
};

let systemPromptCache: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (systemPromptCache) {
    return systemPromptCache;
  }

  const promptPath = path.join(process.cwd(), 'docs', 'prompts', 'system_prompt_master.md');
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
    .replaceAll('{{output_format}}', 'json');
}

function parseInsightPayload(raw: string): InsightPayload {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const fallback: InsightPayload = {
    title: 'Una revelación sobre su aprendizaje de hoy',
    revelation: raw,
    brain_science_gem: 'Cada repetición fortalece conexiones neuronales clave para el aprendizaje profundo.',
    activity: {
      main: 'Invita a tu hijo/a a repetir la misma exploración con un pequeño cambio de material y observa qué estrategia ajusta.',
      express: 'Versión express: nombra en voz alta una sola cosa que está probando y espera su siguiente intento.',
    },
    observe_next: 'La próxima vez, observa la pausa justo antes de actuar: ahí suele aparecer su hipótesis.',
  };

  const source = jsonMatch?.[0] ?? raw;

  try {
    const parsed = JSON.parse(source) as Partial<InsightPayload>;
    return {
      title: parsed.title ?? fallback.title,
      revelation: parsed.revelation ?? fallback.revelation,
      brain_science_gem: parsed.brain_science_gem ?? fallback.brain_science_gem,
      activity: {
        main: parsed.activity?.main ?? fallback.activity.main,
        express: parsed.activity?.express ?? fallback.activity.express,
      },
      observe_next: parsed.observe_next ?? fallback.observe_next,
    };
  } catch {
    const extract = (field: string): string | null => {
      const match = source.match(new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,\\s*"|\\s*})`));
      return match?.[1]?.replaceAll('\\n', '\n') ?? null;
    };

    return {
      title: extract('title') ?? fallback.title,
      revelation: extract('revelation') ?? fallback.revelation,
      brain_science_gem: extract('brain_science_gem') ?? fallback.brain_science_gem,
      activity: {
        main: extract('main') ?? fallback.activity.main,
        express: extract('express') ?? fallback.activity.express,
      },
      observe_next: extract('observe_next') ?? fallback.observe_next,
    };
  }
}

export async function POST(request: Request) {
  try {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada.' }, { status: 500 });
    }

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
      'Devuelve SOLO JSON válido sin markdown ni texto adicional, con este esquema exacto:',
      '{',
      '  "title": "frase corta y poderosa que resume la revelación",',
      '  "revelation": "texto de la revelación principal",',
      '  "brain_science_gem": "dato científico sorprendente",',
      '  "activity": {',
      '    "main": "actividad principal",',
      '    "express": "versión de 30 segundos"',
      '  },',
      '  "observe_next": "pregunta de observación para la próxima vez"',
      '}',
      'Usa el nombre del niño al menos 3 veces y mantén tono cálido y específico.',
    ].join('\n');

    const anthropic = new Anthropic({ apiKey: anthropicApiKey });
    const anthropicStream = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
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

          const parsedPayload = parseInsightPayload(fullResponse);

          const { error: insightError } = await db.from('insights').insert({
            observation_id: observationRow.id,
            content: parsedPayload.revelation,
            insight_text: parsedPayload.revelation,
            json_response: {
              source: 'anthropic_stream',
              model: 'claude-sonnet-4-5-20250929',
              payload: parsedPayload,
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
