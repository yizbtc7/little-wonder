/* eslint-disable no-console */
const Anthropic = require('@anthropic-ai/sdk').default;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const DEFINITIONS = require('./activity-definitions');

if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY');
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase env vars');
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SYSTEM = `You write high-quality parent activities for Little Wonder.
Return STRICT JSON object with keys:
emoji,title,subtitle,schema_target,domain,materials,duration_minutes,steps,science_note,is_featured
Rules:
- language must follow instruction (ES or EN)
- title <= 70 chars, subtitle <= 120 chars
- materials is array of 3-7 household items strings
- duration_minutes between 8 and 60
- steps is 5-8 numbered lines using \\n newlines (1. ...)
- science_note 2-4 sentences, clear and warm
- use {child_name} naturally in subtitle/steps/science_note
- never recommend expensive products
- schema_target one of: trajectory,rotation,enclosure,enveloping,transporting,connecting,transforming,positioning,none
- is_featured boolean`;

function pick(def, lang, batchLabel, iteration) {
  const age = `${def.age_min}-${def.age_max} months`;
  const focus = lang === 'es' ? def.focus_es : def.focus_en;
  const domain = lang === 'es' ? def.domain_es : def.domain_en;

  return `Create one ${lang === 'es' ? 'actividad' : 'activity'} for parents.
Language: ${lang === 'es' ? 'Spanish (LatAm)' : 'English'}
Age band: ${age}
Domain: ${domain}
Suggested schema: ${def.schema_target}
Focus: ${focus}
Batch label: ${batchLabel}
Iteration: ${iteration}
Tone: practical, warm, science-grounded.`;
}

async function genOne(def, lang, batchLabel, iteration) {
  const prompt = pick(def, lang, batchLabel, iteration);
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 900,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });
  const txt = res.content[0].text;
  const cleaned = txt.replace(/^```json\n?|```$/g, '').trim();
  return JSON.parse(cleaned);
}

async function insertActivity(def, lang, item, batchLabel, i) {
  const title = `${item.title} · ${batchLabel}-${i}`;
  const payload = {
    emoji: item.emoji || '✨',
    title,
    subtitle: item.subtitle,
    schema_target: item.schema_target || def.schema_target || 'none',
    domain: item.domain || (lang === 'es' ? def.domain_es : def.domain_en),
    materials: Array.isArray(item.materials) ? item.materials : ['Papel', 'Lápiz', 'Objetos de casa'],
    duration_minutes: Math.max(8, Math.min(60, Number(item.duration_minutes) || 15)),
    steps: item.steps,
    science_note: item.science_note,
    age_min_months: def.age_min,
    age_max_months: def.age_max,
    language: lang,
    is_featured: Boolean(item.is_featured),
  };

  const { error } = await supabase.from('activities').insert(payload);
  if (error) throw error;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const targetArg = process.argv.find((a) => a.startsWith('--target-count='));
  const target = targetArg ? Number(targetArg.split('=')[1]) : 100;
  const batchArg = process.argv.find((a) => a.startsWith('--batch-label='));
  const batch = batchArg ? batchArg.split('=')[1] : 'B1';

  let success = 0;
  let errors = 0;

  for (let n = 0; success < target; n += 1) {
    const def = DEFINITIONS[n % DEFINITIONS.length];
    const lang = n % 2 === 0 ? 'es' : 'en';
    const iter = Math.floor(n / (DEFINITIONS.length * 2)) + 1;

    try {
      console.log(`[${success + 1}/${target}] ${lang} ${def.age_min}-${def.age_max}m`);
      const item = await genOne(def, lang, batch, iter);
      await insertActivity(def, lang, item, batch, success + 1);
      success += 1;
      await sleep(1000);
    } catch (e) {
      console.error('error:', e.message);
      errors += 1;
      await sleep(4000);
    }
  }

  console.log({ success, errors });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
