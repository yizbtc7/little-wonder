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
- language must follow instruction exactly (ES or EN)
- age-personalization is strict: all wording, challenge level and safety must match the exact age band
- title <= 70 chars, subtitle <= 120 chars
- materials is array of 3-7 affordable household items strings
- duration_minutes between 8 and 60
- steps is 5-8 numbered lines using \n newlines (1. ...)
- science_note 2-4 sentences, clear and warm
- use {child_name} naturally in subtitle/steps/science_note
- never recommend expensive products or unsafe actions
- avoid generic ideas and near-duplicates of provided recent titles
- ensure domain and schema are clearly represented in the activity design
- schema_target one of: trajectory,rotation,enclosure,enveloping,transporting,connecting,transforming,positioning,none
- is_featured boolean`;

function canonicalTitleKey(title) {
  return (title || '')
    .toLowerCase()
    .replace(/\s*[·•]\s*refill-[^\n]+$/i, '')
    .replace(/\s*[·•]\s*v\d+$/i, '')
    .replace(/\s*[·•]\s*b\d+(?:-[\w-]+)?$/i, '')
    .replace(/[^{\p{L}\p{N}}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseArg(name) {
  const hit = process.argv.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.split('=')[1] : null;
}

function pick(def, lang, batchLabel, iteration, recentTitles = []) {
  const age = `${def.age_min}-${def.age_max} months`;
  const focus = lang === 'es' ? def.focus_es : def.focus_en;
  const domain = lang === 'es' ? def.domain_es : def.domain_en;

  return `Create one ${lang === 'es' ? 'actividad' : 'activity'} for parents.
Language: ${lang === 'es' ? 'Spanish (LatAm)' : 'English'}
Age band: ${age}
Domain: ${domain}
Required schema target: ${def.schema_target}
Focus: ${focus}
Batch label: ${batchLabel}
Iteration: ${iteration}
Recent titles to avoid repeating: ${recentTitles.length ? recentTitles.join(' | ') : 'none'}
Tone: practical, warm, science-grounded.
Need novelty: different setup, materials and parent-child interaction from recent titles.`;
}

async function recentTitlesForBand(def, lang, limit = 80) {
  const { data, error } = await supabase
    .from('activities')
    .select('title')
    .eq('language', lang)
    .eq('age_min_months', def.age_min)
    .eq('age_max_months', def.age_max)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => row.title).filter(Boolean);
}

async function genOne(def, lang, batchLabel, iteration, recentTitles) {
  const prompt = pick(def, lang, batchLabel, iteration, recentTitles.slice(0, 12));
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
  const target = Number(parseArg('--target-count') || 24);
  const batch = parseArg('--batch-label') || `B${Date.now().toString().slice(-5)}`;
  const ageMin = parseArg('--age-min');
  const ageMax = parseArg('--age-max');
  const onlyLang = parseArg('--lang');

  const defs = DEFINITIONS.filter((d) => {
    if (ageMin && d.age_min !== Number(ageMin)) return false;
    if (ageMax && d.age_max !== Number(ageMax)) return false;
    return true;
  });

  const langs = onlyLang ? [onlyLang] : ['es', 'en'];
  if (defs.length === 0) throw new Error('No activity definitions match provided filters');

  let success = 0;
  let errors = 0;
  const seenByBandLang = new Map();

  for (let n = 0; success < target; n += 1) {
    const def = defs[n % defs.length];
    const lang = langs[n % langs.length];
    const key = `${lang}:${def.age_min}-${def.age_max}`;

    try {
      const cached = seenByBandLang.get(key) ?? (await recentTitlesForBand(def, lang));
      const canonicalSeen = new Set(cached.map((t) => canonicalTitleKey(t)));
      seenByBandLang.set(key, cached);

      let item = null;
      let accepted = false;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const iter = Math.floor(n / (defs.length * langs.length)) + 1 + attempt;
        item = await genOne(def, lang, batch, iter, cached);
        const generatedKey = canonicalTitleKey(item?.title || '');
        if (!generatedKey || canonicalSeen.has(generatedKey)) {
          console.log(`skip near-duplicate title for ${key}: ${item?.title || 'N/A'}`);
          await sleep(700);
          continue;
        }
        accepted = true;
        break;
      }

      if (!accepted || !item) {
        errors += 1;
        console.log(`failed to generate unique activity for ${key}`);
        await sleep(1800);
        continue;
      }

      console.log(`[${success + 1}/${target}] ${lang} ${def.age_min}-${def.age_max}m ${def.schema_target}`);
      await insertActivity(def, lang, item, batch, success + 1);
      cached.unshift(item.title);
      if (cached.length > 120) cached.length = 120;
      success += 1;
      await sleep(1000);
    } catch (e) {
      console.error('error:', e.message);
      errors += 1;
      await sleep(3500);
    }
  }

  console.log({ success, errors });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
