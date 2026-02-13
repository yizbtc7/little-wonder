import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatAgeLabel, getAgeInMonths } from '@/lib/childAge';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type ChildRow = {
  id: string;
  user_id: string;
  name: string;
  birthdate: string;
};

type DailyContentRow = {
  child_id: string;
  date: string;
  content: unknown;
};

let stagePromptCache: string | null = null;

async function getStagePrompt(): Promise<string> {
  if (stagePromptCache) {
    return stagePromptCache;
  }

  const promptPath = path.join(process.cwd(), 'docs', 'prompts', 'stage_content_prompt.md');
  stagePromptCache = await readFile(promptPath, 'utf8');
  return stagePromptCache;
}

function getBogotaDateParts(now = new Date()) {
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const today = dateFormatter.format(now);

  const yearFormatter = new Intl.DateTimeFormat('en', { timeZone: 'America/Bogota', year: 'numeric' });
  const year = Number(yearFormatter.format(now));

  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const todayDate = new Date(`${today}T00:00:00Z`);
  const diffMs = todayDate.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  return { today, daySeed: dayOfYear % 10 };
}

function extractJson(raw: string): unknown {
  const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]) as unknown;
  } catch {
    return null;
  }
}

function buildFallbackDailyContent(childName: string) {
  return {
    section_title: `What's happening inside ${childName}'s brain?`,
    cards: [
      {
        icon: '🧠',
        title: 'Hipótesis en tiempo real',
        domain: 'Cognitive/Language',
        preview: `${childName} está conectando lenguaje con causa y efecto en cada repetición cotidiana.`,
        full: {
          whats_happening: `${childName}'s brain is building mental models for how the world works. Repetition here strengthens memory, prediction, and decision pathways.`,
          youll_see_it_when: [
            'Repeats one action to test if the result changes',
            'Checks your reaction before trying again',
            'Connects events as before and after',
            'Insists on understanding one sequence clearly',
          ],
          fascinating_part: 'These micro-tests are early foundations of scientific thinking.',
          how_to_be_present: `Describe what you see and leave a short pause so ${childName} can continue. Presence without interruption deepens reasoning.`,
        },
      },
      {
        icon: '🎭',
        title: 'Símbolos que cobran vida',
        domain: 'Imagination/Symbolic Thinking',
        preview: `${childName} puede usar un objeto como si fuera otro: eso es abstracción en acción.`,
        full: {
          whats_happening: `Cuando ${childName} convierte objetos en personajes o herramientas imaginarias, integra memoria, lenguaje e imaginación en un solo circuito.`,
          youll_see_it_when: [
            'Usa objetos cotidianos con funciones imaginarias',
            'Imitates scenes from the day during play',
            'Sostiene una mini-historia por varios turnos',
            'Asigna roles a personas u objetos',
          ],
          fascinating_part: 'El juego simbólico temprano se asocia con avances en lenguaje y autorregulación.',
          how_to_be_present: `First follow ${childName}'s narrative. Then expand with one short line instead of redirecting the whole play flow.`,
        },
      },
      {
        icon: '🤝',
        title: 'Mapeo social emergente',
        domain: 'Social-Emotional',
        preview: `${childName} está aprendiendo que otras personas piensan y sienten distinto.`,
        full: {
          whats_happening: `${childName}'s social brain is refining how to read emotions and adapt behavior by context and relationship.`,
          youll_see_it_when: [
            'Checks your face to calibrate new situations',
            'Names or points to basic emotions',
            'Adjusts behavior based on who is present',
            'Attempts repair after frustration',
          ],
          fascinating_part: 'Understanding different minds is a core foundation of empathy and cooperation.',
          how_to_be_present: `Name emotions with simple, non-judgmental language. Your calm helps ${childName} organize their inner emotional world.`,
        },
      },
    ],
  };
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

    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: child } = await db
      .from('children')
      .select('id,user_id,name,birthdate')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<ChildRow>();

    if (!child) {
      return NextResponse.json({ error: 'You need to complete onboarding first.' }, { status: 400 });
    }

    const { today, daySeed } = getBogotaDateParts();

    const { data: cached } = await db
      .from('daily_content')
      .select('child_id,date,content')
      .eq('child_id', child.id)
      .eq('date', today)
      .maybeSingle<DailyContentRow>();

    if (cached?.content) {
      return NextResponse.json({ source: 'cache', content: cached.content });
    }

    const childAgeMonths = getAgeInMonths(child.birthdate);
    const childAgeLabel = formatAgeLabel(childAgeMonths);
    const appLang = request.headers.get('accept-language')?.toLowerCase().startsWith('es') ? 'es' : 'en';

    const promptTemplate = await getStagePrompt();
    const prompt = promptTemplate
      .replaceAll('{{child_name}}', child.name)
      .replaceAll('{{child_age_months}}', `${childAgeMonths}`)
      .replaceAll('{{child_age_label}}', childAgeLabel)
      .replaceAll('{{day_seed}}', `${daySeed}`);

    const userPrompt = [
      `Generate today's daily stage content for ${child.name}.`,
      `day_seed=${daySeed}`,
      appLang === 'es' ? 'Responde en español.' : 'Respond in English.',
      'Return only valid JSON. No markdown.',
    ].join('\n');

    const anthropic = new Anthropic({ apiKey: anthropicApiKey });
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1400,
      temperature: 0.4,
      system: prompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const fullText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const parsed = extractJson(fullText) ?? buildFallbackDailyContent(child.name);

    await db.from('daily_content').upsert(
      {
        child_id: child.id,
        date: today,
        content: parsed,
      },
      { onConflict: 'child_id,date' }
    );

    return NextResponse.json({ source: 'generated', content: parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
