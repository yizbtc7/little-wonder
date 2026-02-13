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
    section_title: `¿Qué está pasando en el cerebro de ${childName}?`,
    cards: [
      {
        icon: '🧠',
        title: 'Hipótesis en tiempo real',
        domain: 'Cognitive/Language',
        preview: `${childName} está conectando lenguaje con causa y efecto en cada repetición cotidiana.`,
        full: {
          whats_happening: `El cerebro de ${childName} está construyendo modelos mentales sobre cómo funciona el mundo. Cada repetición consolida memoria, predicción y toma de decisiones.`,
          youll_see_it_when: [
            'Repite una acción para ver si el resultado cambia',
            'Observa tu reacción antes de intentar de nuevo',
            'Conecta eventos con “antes” y “después”',
            'Insiste en entender una secuencia concreta',
          ],
          fascinating_part: 'Estas micro-pruebas son cimientos tempranos del pensamiento científico.',
          how_to_be_present: `Describe lo que ves y deja una pausa para que ${childName} continúe. Acompañar sin interrumpir profundiza su razonamiento.`,
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
            'Imita escenas del día en forma de juego',
            'Sostiene una mini-historia por varios turnos',
            'Asigna roles a personas u objetos',
          ],
          fascinating_part: 'El juego simbólico temprano se asocia con avances en lenguaje y autorregulación.',
          how_to_be_present: `Primero sigue la narrativa de ${childName}. Luego amplía con una frase breve en lugar de redirigir todo el juego.`,
        },
      },
      {
        icon: '🤝',
        title: 'Mapeo social emergente',
        domain: 'Social-Emotional',
        preview: `${childName} está aprendiendo que otras personas piensan y sienten distinto.`,
        full: {
          whats_happening: `El cerebro social de ${childName} está refinando cómo leer emociones y ajustar conducta según contexto y vínculo.`,
          youll_see_it_when: [
            'Observa tu rostro para calibrar situaciones nuevas',
            'Nombra emociones básicas o las señala',
            'Ajusta su conducta según quién esté presente',
            'Busca reparar conexión después de frustrarse',
          ],
          fascinating_part: 'Comprender mentes distintas es una base central de empatía y cooperación.',
          how_to_be_present: `Nombra emociones con lenguaje simple y sin juicio. Tu calma ayuda a ${childName} a organizar su mundo emocional interno.`,
        },
      },
    ],
  };
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

    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: child } = await db
      .from('children')
      .select('id,user_id,name,birthdate')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<ChildRow>();

    if (!child) {
      return NextResponse.json({ error: 'Debes completar onboarding primero.' }, { status: 400 });
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
