import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatAgeLabel, getAgeInMonths } from '@/lib/childAge';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getUserLanguage } from '@/lib/language';
import { VALID_SCHEMA_KEYS, normalizeSchemaList } from '@/lib/schemas';
import { getChildInterestOptions } from '@/lib/interest-options';
import { resolveAccessibleChild } from '@/lib/childAccess';

type InsightRequestBody = {
  observation?: string;
  auto_update_interests?: boolean;
};

type ChildRow = {
  id: string;
  user_id: string;
  name: string;
  birthdate: string;
  interests?: string[] | null;
  curiosity_quote_updated_at?: string | null;
};

type ProfileRow = {
  user_id: string;
  parent_name: string;
  parent_role?: string | null;
};

type WonderPayload = {
  title: string;
  article: {
    lead: string;
    pull_quote: string;
    signs: string[];
    how_to_be_present: string;
    curiosity_closer: string;
  };
  schemas_detected: string[];
};

type InsightPayload = {
  reply: string;
  wonder: WonderPayload | null;
  auto_interest_added?: string | null;
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
  responseLanguage: 'en' | 'es';
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
    responseLanguage,
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
    .replaceAll('{{output_format}}', 'json')
    .concat(`\n\nRespond in ${responseLanguage === 'es' ? 'Spanish' : 'English'} only.`);
}

function parseInsightPayload(raw: string): InsightPayload {
  const clean = raw
    .trim()
    .replace(/^`{3,}\s*json\s*/i, '')
    .replace(/^`{3,}\s*/i, '')
    .replace(/^json\s*/i, '')
    .replace(/`{3,}$/i, '')
    .trim();

  const fallback: InsightPayload = {
    reply: clean,
    wonder: null,
  };

  const parseCandidate = (input: string): Partial<InsightPayload> | null => {
    try {
      return JSON.parse(input) as Partial<InsightPayload>;
    } catch {
      const match = input.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return JSON.parse(match[0]) as Partial<InsightPayload>;
      } catch {
        return null;
      }
    }
  };

  let parsed = parseCandidate(clean) ?? parseCandidate(clean.replaceAll('\\"', '"').replaceAll('\\n', '\n'));

  if (!parsed) return fallback;

  let parsedPayload: Partial<InsightPayload> = parsed;

  for (let i = 0; i < 3; i += 1) {
    if (typeof parsedPayload.reply !== 'string') break;
    const nested = parseCandidate(parsedPayload.reply) ?? parseCandidate(parsedPayload.reply.replaceAll('\\"', '"').replaceAll('\\n', '\n'));
    if (!nested) break;
    parsedPayload = { ...parsedPayload, ...nested };
  }

  const wonder = parsedPayload.wonder
    ? {
        title: parsedPayload.wonder.title ?? 'New Wonder',
        article: {
          lead: parsedPayload.wonder.article?.lead ?? '',
          pull_quote: parsedPayload.wonder.article?.pull_quote ?? '',
          signs: Array.isArray(parsedPayload.wonder.article?.signs) ? parsedPayload.wonder.article.signs : [],
          how_to_be_present: parsedPayload.wonder.article?.how_to_be_present ?? '',
          curiosity_closer: parsedPayload.wonder.article?.curiosity_closer ?? '',
        },
        schemas_detected: normalizeSchemaList(parsedPayload.wonder.schemas_detected),
      }
    : null;

  return {
    reply: typeof parsedPayload.reply === 'string' && parsedPayload.reply.trim().length > 0 ? parsedPayload.reply.trim() : fallback.reply,
    wonder,
  };
}

function shouldGenerateWonderFromObservation(observationText: string, childName: string): boolean {
  const text = observationText.toLowerCase().trim();
  if (text.length < 12) return false;

  const irrelevantPatterns = [
    /^hola\b/, /^hello\b/, /^hi\b/, /^test\b/, /^prueba\b/, /^ok\b/, /^gracias\b/, /^thanks\b/,
    /que puedes hacer/, /what can you do/, /funciona\?$/, /are you there\?$/,
  ];
  if (irrelevantPatterns.some((pattern) => pattern.test(text))) return false;

  const behaviorVerbs = [
    'hace', 'hizo', 'está', 'esta', 'jugó', 'jugo', 'dijo', 'preguntó', 'pregunto', 'lloró', 'lloro', 'corrió', 'corrio',
    'played', 'said', 'asked', 'cried', 'ran', 'stacked', 'pointed', 'noticed', 'tantrum',
  ];

  const childSignals = ['mi hijo', 'mi hija', 'my child', 'bebé', 'bebe', childName.toLowerCase()];

  const hasChildSignal = childSignals.some((signal) => signal && text.includes(signal));
  const hasBehaviorSignal = behaviorVerbs.some((verb) => text.includes(verb));

  return hasChildSignal && hasBehaviorSignal;
}

function normalizeInterestValue(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function interestsAreSimilar(a: string, b: string): boolean {
  const aNorm = normalizeInterestValue(a);
  const bNorm = normalizeInterestValue(b);
  if (!aNorm || !bNorm) return false;
  if (aNorm === bNorm) return true;
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return true;

  const aWords = aNorm.split(' ').filter((w) => w.length >= 4);
  const bWords = new Set(bNorm.split(' ').filter((w) => w.length >= 4));
  return aWords.some((word) => bWords.has(word));
}

function inferInterestFromObservation(observationText: string, language: 'es' | 'en'): { interest: string; score: number } | null {
  const text = normalizeInterestValue(observationText);

  const rules: Array<{ interestKey: string; hints: string[] }> = [
    { interestKey: 'music', hints: ['musica', 'music', 'cantar', 'song', 'ritmo', 'sonido'] },
    { interestKey: 'stacking', hints: ['apilar', 'bloque', 'stack', 'tower', 'constru'] },
    { interestKey: 'water', hints: ['agua', 'water', 'salpicar', 'splash'] },
    { interestKey: 'animals', hints: ['animal', 'insect', 'bicho', 'bug'] },
    { interestKey: 'books', hints: ['libro', 'cuento', 'book', 'read'] },
    { interestKey: 'movement', hints: ['trepar', 'correr', 'saltar', 'climb', 'run', 'movement'] },
    { interestKey: 'drawing', hints: ['dibuj', 'pint', 'arte', 'draw', 'paint', 'messy'] },
    { interestKey: 'how', hints: ['como funciona', 'how works', 'mecan', 'experimento', 'experiment'] },
  ];

  const scored = rules
    .map((rule) => ({
      rule,
      score: rule.hints.reduce((acc, hint) => (text.includes(hint) ? acc + 1 : acc), 0),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 2) return null;

  const options = getChildInterestOptions(language);
  const map: Record<string, number> = {
    music: 0,
    stacking: 1,
    water: 2,
    animals: 3,
    books: 4,
    movement: 5,
    drawing: 6,
    how: 7,
  };

  const index = map[best.rule.interestKey];
  const interest = typeof index === 'number' ? String(options[index]) : null;
  return interest ? { interest, score: best.score } : null;
}

function buildNoWonderReply(params: {
  language: 'es' | 'en';
  childName: string;
  childAgeLabel: string;
  childInterests: string[];
  detectedSchemas: string[];
}): string {
  const { language, childName, childAgeLabel, childInterests, detectedSchemas } = params;

  const topInterest = childInterests[0]?.trim();
  const topSchema = detectedSchemas[0]?.trim();

  if (language === 'es') {
    const contextBits = [
      `${childName} (${childAgeLabel})`,
      topInterest ? `interés: ${topInterest}` : null,
      topSchema ? `esquema frecuente: ${topSchema}` : null,
    ].filter(Boolean).join(' · ');

    return `¡Te leo! Para darte un Wonder útil, cuéntame una observación concreta de hoy sobre ${contextBits}. Ejemplos: qué hizo con un objeto, cómo se movió, qué dijo o cómo reaccionó ante algo.`;
  }

  const contextBits = [
    `${childName} (${childAgeLabel})`,
    topInterest ? `interest: ${topInterest}` : null,
    topSchema ? `frequent schema: ${topSchema}` : null,
  ].filter(Boolean).join(' · ');

  return `I’m here with you. To generate a useful Wonder, share one concrete observation from today about ${contextBits}. For example: what your child did with an object, how they moved, what they said, or how they reacted to something.`;
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
    const autoUpdateInterests = body.auto_update_interests !== false;

    if (!observationText) {
      return NextResponse.json({ error: 'Observation is empty.' }, { status: 400 });
    }

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [{ data: profile }, child] = await Promise.all([
      db.from('profiles').select('user_id,parent_name,parent_role').eq('user_id', user.id).maybeSingle<ProfileRow>(),
      resolveAccessibleChild(db, user.id) as Promise<ChildRow | null>,
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

    const detectedSchemas = normalizeSchemaList(
      (recentInsightRows ?? []).flatMap((row) => {
        const fromSchemaDetected = typeof row.schema_detected === 'string' ? [row.schema_detected] : [];
        const fromJson = Array.isArray((row.json_response as { payload?: { schemas_detected?: string[] } } | null)?.payload?.schemas_detected)
          ? (row.json_response as { payload?: { schemas_detected?: string[] } }).payload?.schemas_detected ?? []
          : [];
        return [...fromSchemaDetected, ...fromJson];
      })
    ).slice(0, 10);

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
    const preferredLanguage = await getUserLanguage(user.id, 'es');

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
      responseLanguage: preferredLanguage,
    });

    const userPrompt = [
      `Today\'s observation about ${child.name}:`,
      observationText,
      '',
      'Return ONLY valid JSON with no markdown, no code fences, and no extra text.',
      'Use EXACTLY this JSON schema and keys:',
      '{',
      '  "reply": "Short conversational response (2-3 sentences)",',
      '  "wonder": {',
      '    "title": "Wonder article title",',
      '    "article": {',
      '      "lead": "Opening paragraph of the Wonder article",',
      '      "pull_quote": "One-sentence insight the parent will remember",',
      '      "signs": ["Sign 1", "Sign 2", "Sign 3"],',
      '      "how_to_be_present": "Practical suggestion",',
      '      "curiosity_closer": "One sentence connecting to long-term curiosity"',
      '    },',
      '    "schemas_detected": ["trajectory", "connecting"]',
      '  } // or null when the message is not a concrete child observation',
      '}',
      'Do NOT return top-level keys like title, revelation, brain_science_gem, activity, observe_next, or schemas_detected.',
      `Allowed schemas_detected values only: ${VALID_SCHEMA_KEYS.join(', ')}.`,
      'Never invent or output schema labels outside that list; map legacy wording to the closest allowed value.',
      'Only generate wonder when the parent shares a specific real behavior/moment of the child.',
      'If input is greeting/test/meta/unclear, set wonder to null and ask for a concrete observation.',
      'Use the child\'s name naturally and keep the tone warm and specific.',
      preferredLanguage === 'es' ? 'Write every value in Spanish.' : 'Write every value in English.',
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
            }
          }

          const parsedPayload = parseInsightPayload(fullResponse);
          const shouldGenerateWonder = shouldGenerateWonderFromObservation(observationText, child.name);

          const normalizedPayload: InsightPayload = shouldGenerateWonder
            ? parsedPayload
            : {
                reply: buildNoWonderReply({
                  language: preferredLanguage,
                  childName: child.name,
                  childAgeLabel,
                  childInterests: Array.isArray(child.interests) ? child.interests : [],
                  detectedSchemas,
                }),
                wonder: null,
              };

          const insightText = normalizedPayload.reply;

          const { data: insertedInsight, error: insightError } = await db.from('insights').insert({
            observation_id: observationRow.id,
            content: insightText,
            insight_text: insightText,
            json_response: {
              source: 'anthropic_stream',
              model: 'claude-sonnet-4-5-20250929',
              payload: normalizedPayload,
            },
            schema_detected: null,
            domain: null,
          }).select('id').single<{ id: string }>();

          if (insightError || !insertedInsight?.id) {
            controller.error(new Error(`Error saving insight: ${insightError?.message ?? 'unknown'}`));
            return;
          }

          if (normalizedPayload.wonder) {
            const { error: wonderError } = await db.from('wonders').insert({
              child_id: child.id,
              observation_text: observationText,
              title: normalizedPayload.wonder.title,
              article: normalizedPayload.wonder.article,
              schemas_detected: normalizedPayload.wonder.schemas_detected ?? [],
              language: preferredLanguage,
            });

            if (wonderError) {
              controller.error(new Error(`Error saving wonder: ${wonderError.message}`));
              return;
            }

            if (autoUpdateInterests) {
              const inferredInterestResult = inferInterestFromObservation(observationText, preferredLanguage);
              if (inferredInterestResult) {
                const inferredInterest = inferredInterestResult.interest;

                const { data: existingInterestRows } = await db
                  .from('child_interests')
                  .select('interest')
                  .eq('child_id', child.id);

                const existingInterests = (existingInterestRows ?? [])
                  .map((row) => (row as { interest?: string | null }).interest ?? '')
                  .filter((value): value is string => value.trim().length > 0);

                const alreadyExists = existingInterests.some((existing) => interestsAreSimilar(existing, inferredInterest));

                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                const { data: todaysObservationRows } = await db
                  .from('observations')
                  .select('id')
                  .eq('user_id', user.id)
                  .eq('child_id', child.id)
                  .gte('created_at', startOfDay.toISOString())
                  .order('created_at', { ascending: false })
                  .limit(200);

                const todaysObservationIds = (todaysObservationRows ?? []).map((row) => row.id).filter(Boolean);

                let autoAddedToday = 0;
                if (todaysObservationIds.length > 0) {
                  const { data: todaysInsightsRows } = await db
                    .from('insights')
                    .select('json_response,observation_id')
                    .in('observation_id', todaysObservationIds as string[]);

                  autoAddedToday = (todaysInsightsRows ?? []).reduce((count, row) => {
                    const payload = row.json_response as { payload?: { auto_interest_added?: string | null } } | null;
                    return payload?.payload?.auto_interest_added ? count + 1 : count;
                  }, 0);
                }

                const canAutoAddToday = autoAddedToday < 2;

                if (!alreadyExists && canAutoAddToday) {
                  const { error: addInterestError } = await db.from('child_interests').insert({
                    child_id: child.id,
                    interest: inferredInterest,
                  });

                  if (!addInterestError) {
                    normalizedPayload.auto_interest_added = inferredInterest;
                    if (preferredLanguage === 'es') {
                      normalizedPayload.reply = `${normalizedPayload.reply}\n\n✨ Agregué “${inferredInterest}” a los intereses de ${child.name}. Si quieres, lo puedes quitar luego desde Perfil.`;
                    } else {
                      normalizedPayload.reply = `${normalizedPayload.reply}\n\n✨ I added “${inferredInterest}” to ${child.name}'s interests. You can remove it later from Profile.`;
                    }
                  }
                }
              }
            }
          }

          if (normalizedPayload.reply !== insightText || normalizedPayload.auto_interest_added) {
            await db
              .from('insights')
              .update({
                content: normalizedPayload.reply,
                insight_text: normalizedPayload.reply,
                json_response: {
                  source: 'anthropic_stream',
                  model: 'claude-sonnet-4-5-20250929',
                  payload: normalizedPayload,
                },
              })
              .eq('id', insertedInsight.id);
          }

          controller.enqueue(encoder.encode(JSON.stringify(normalizedPayload)));
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
