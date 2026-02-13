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
  interests?: string[] | null;
};

type ProfileRow = {
  user_id: string;
  parent_name: string;
  parent_role?: string | null;
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
  schemas_detected: string[];
};

let systemPromptCache: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (systemPromptCache) {
    return systemPromptCache;
  }

  const v4Path = path.join(process.cwd(), 'docs', 'prompts', 'little_wonder_system_prompt_v4.md');
  const fallbackPath = path.join(process.cwd(), 'docs', 'prompts', 'system_prompt_master.md');

  try {
    const fileContent = await readFile(v4Path, 'utf8');
    systemPromptCache = fileContent;
    return fileContent;
  } catch {
    const fileContent = await readFile(fallbackPath, 'utf8');
    systemPromptCache = fileContent;
    return fileContent;
  }
}

function buildPromptContext(params: {
  promptTemplate: string;
  parentName: string;
  parentRole: string;
  childName: string;
  childAgeMonths: number;
  childAgeLabel: string;
  childInterests: string[];
  recentObservations: string[];
  detectedSchemas: string[];
  sessionCount: number;
}): string {
  const {
    promptTemplate,
    parentName,
    parentRole,
    childName,
    childAgeMonths,
    childAgeLabel,
    childInterests,
    recentObservations,
    detectedSchemas,
    sessionCount,
  } = params;

  return promptTemplate
    .replaceAll('{{parent_name}}', parentName)
    .replaceAll('{{parent_role}}', parentRole)
    .replaceAll('{{child_name}}', childName)
    .replaceAll('{{child_age_months}}', `${childAgeMonths}`)
    .replaceAll('{{child_age_label}}', childAgeLabel)
    .replaceAll('{{child_interests}}', childInterests.join(', '))
    .replaceAll('{{recent_observations}}', recentObservations.join('\n- '))
    .replaceAll('{{detected_schemas}}', detectedSchemas.join(', '))
    .replaceAll('{{session_count}}', `${sessionCount}`)
    .replaceAll('{{output_format}}', 'json');
}

function parseInsightPayload(raw: string): InsightPayload {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const fallback: InsightPayload = {
    title: 'A revelation from today\'s learning',
    revelation: raw,
    brain_science_gem: 'Each repetition strengthens neural pathways for deeper learning.',
    activity: {
      main: 'Invite your child to repeat the same exploration with one small material change and observe what strategy shifts first.',
      express: 'Quick version: name one thing they are testing and pause for the next attempt.',
    },
    observe_next: 'Next time, watch the pause right before action — that often reveals the hypothesis.',
    schemas_detected: [],
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
      schemas_detected: Array.isArray(parsed.schemas_detected)
        ? parsed.schemas_detected.filter((value): value is string => typeof value === 'string')
        : fallback.schemas_detected,
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
      schemas_detected: fallback.schemas_detected,
    };
  }
}

export async function POST(request: Request) {
  try {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, { status: 500 });
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
      return NextResponse.json({ error: 'Observation is empty.' }, { status: 400 });
    }

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [{ data: profile }, { data: child }] = await Promise.all([
      db.from('profiles').select('user_id,parent_name,parent_role').eq('user_id', user.id).maybeSingle<ProfileRow>(),
      db
        .from('children')
        .select('id,user_id,name,birthdate,interests')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle<ChildRow>(),
    ]);

    if (!profile || !child) {
      return NextResponse.json({ error: 'You need to complete onboarding first.' }, { status: 400 });
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

    const { data: recentInsightRows } = await db
      .from('insights')
      .select('schema_detected,json_response')
      .order('created_at', { ascending: false })
      .limit(10);

    const detectedSchemas = (recentInsightRows ?? [])
      .flatMap((row) => {
        const fromSchemaDetected = typeof row.schema_detected === 'string' ? [row.schema_detected] : [];
        const fromJson = Array.isArray((row.json_response as { payload?: { schemas_detected?: string[] } } | null)?.payload?.schemas_detected)
          ? (row.json_response as { payload?: { schemas_detected?: string[] } }).payload?.schemas_detected ?? []
          : [];
        return [...fromSchemaDetected, ...fromJson];
      })
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .slice(0, 10);

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
      return NextResponse.json({ error: `Error saving observation: ${observationError?.message}` }, { status: 500 });
    }

    const childAgeMonths = getAgeInMonths(child.birthdate);
    const childAgeLabel = formatAgeLabel(childAgeMonths);

    const promptTemplate = await getSystemPrompt();
    const systemPrompt = buildPromptContext({
      promptTemplate,
      parentName: profile.parent_name,
      parentRole: profile.parent_role ?? 'caregiver',
      childName: child.name,
      childAgeMonths,
      childAgeLabel,
      childInterests: Array.isArray(child.interests) ? child.interests : [],
      recentObservations,
      detectedSchemas,
      sessionCount: recentObservations.length + 1,
    });

    const userPrompt = [
      `Today\'s observation about ${child.name}:`,
      observationText,
      '',
      'Return ONLY valid JSON with no markdown or extra text using this exact schema:',
      '{',
      '  "title": "short powerful line that summarizes the revelation",',
      '  "revelation": "main revelation text",',
      '  "brain_science_gem": "surprising science insight",',
      '  "activity": {',
      '    "main": "main activity",',
      '    "express": "30-second version"',
      '  },',
      '  "observe_next": "what to watch next time",',
      '  "schemas_detected": ["schema1", "schema2"]',
      '}',
      'Return raw JSON only. No markdown, no fences, no commentary.',
      'Use the child\'s name at least 3 times and keep a warm, specific tone.',
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
            controller.error(new Error(`Error saving insight: ${insightError.message}`));
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
