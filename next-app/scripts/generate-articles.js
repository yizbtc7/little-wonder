/* eslint-disable no-console */
const Anthropic = require('@anthropic-ai/sdk').default;
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const ARTICLE_DEFINITIONS = require('./article-definitions');

if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
const supabase = !pool
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const SYSTEM_PROMPT = `You are the editorial voice of Little Wonder, a curiosity companion app for parents.
Write warm, science-grounded long-form content (800-1200 words) with practical guidance.

CRITICAL FORMAT (markdown required because app renders styled cards from these markers):
- Use markdown headings with ##
- Use {child_name} placeholder naturally (exact snake_case)
- Include these blocks exactly in this order at least once:
  1) Hook paragraphs
  2) ## Science section(s)
  3) > 💡 Pull quote sentence
  4) > 🔬 **Short science title** science explanation paragraph
  5) ---
  6) ## Practical response section
  7) 1. **Title** — explanation
  8) 2. **Title** — explanation
  9) 3. **Title** — explanation
  10) > 🌱 Practical home action paragraph
  11) ---
  12) > 💛 Warm emotional closing paragraph
- Include specific researchers/findings in plain language
- Never use pathologizing language or child comparisons
- Never suggest expensive products
- Keep all output as markdown only (no JSON, no code fences)
Return ONLY article body text.`;

function pickEmoji(domain) {
  const map = {
    'Visual Development': '👀',
    Language: '🗣️',
    'Social-Emotional': '🤱',
    'Sensory Exploration': '👄',
    'Cognitive Development': '🧠',
    Cognitive: '🧠',
    'Scientific Thinking': '🔬',
    'Motor & Cognitive': '🚶',
    Autonomy: '✊',
    'Emotional Regulation': '💛',
    'Causal Thinking': '❓',
    Learning: '📚',
    Social: '👫',
    Motivation: '🔥',
    'School Readiness': '🎒',
    Technology: '📱',
    Creativity: '🎨',
    Communication: '💬',
    Neuroscience: '🧪',
    'Critical Thinking': '📰',
    Identity: '🪞',
    Purpose: '🧭',
    Attachment: '🤝',
  };

  if (map[domain]) return map[domain];
  const found = Object.keys(map).find((k) => domain.toLowerCase().includes(k.toLowerCase()));
  return found ? map[found] : '✨';
}

function estimateReadTime(body) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(5, Math.ceil(words / 180));
}

function ageDesc(ageMax) {
  if (ageMax <= 4) return 'newborn (0-4 months)';
  if (ageMax <= 8) return 'baby (4-8 months)';
  if (ageMax <= 14) return 'baby/young toddler (8-14 months)';
  if (ageMax <= 24) return 'toddler (14-24 months)';
  if (ageMax <= 36) return 'toddler (2-3 years)';
  if (ageMax <= 48) return 'preschooler (3-4 years)';
  if (ageMax <= 60) return 'preschooler (4-5 years)';
  if (ageMax <= 84) return 'young child (5-7 years)';
  if (ageMax <= 108) return 'child (7-9 years)';
  if (ageMax <= 132) return 'older child (9-11 years)';
  return 'pre-teen (11-12 years)';
}

async function generateArticle(def, lang) {
  const topic = lang === 'es' ? def.topic_es : def.topic;
  const langInstruction =
    lang === 'es'
      ? 'Write in Spanish (LatAm), warm and natural. Use tú, never usted.'
      : 'Write in English.';

  const prompt = `Write a full article (800-1200 words) for parents of a ${ageDesc(def.age_max)} on topic: "${topic}".
Science to weave in naturally: ${def.key_science}.
${langInstruction}
Use {child_name} placeholder throughout.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2600,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

function generateSummary(body) {
  const clean = body.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  const sentence = clean.split(/(?<=[.!?])\s+/)[0] || clean;
  return sentence.slice(0, 180);
}

async function exists(title, lang) {
  if (pool) {
    const { rows } = await pool.query('select id from explore_articles where title = $1 and language = $2 limit 1', [title, lang]);
    return rows.length > 0;
  }

  const { data, error } = await supabase.from('explore_articles').select('id').eq('title', title).eq('language', lang).limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

async function saveArticle(def, lang, body, summary, variantLabel = '') {
  const baseTitle = lang === 'es' ? def.topic_es : def.topic;
  const domain = lang === 'es' ? def.domain_es : def.domain_en;
  const emoji = pickEmoji(def.domain_en);
  const readTime = estimateReadTime(body);
  const title = `${baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1)}${variantLabel ? ` ${variantLabel}` : ''}`;

  if (pool) {
    const q = `
      insert into explore_articles
        (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language)
      values
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      returning id
    `;

    const { rows } = await pool.query(q, [emoji, title, def.type, domain, summary, body, readTime, def.age_min, def.age_max, lang]);
    return rows[0]?.id;
  }

  const { data, error } = await supabase
    .from('explore_articles')
    .insert({
      emoji,
      title,
      type: def.type,
      domain,
      summary,
      body,
      read_time_minutes: readTime,
      age_min_months: def.age_min,
      age_max_months: def.age_max,
      language: lang,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data?.id;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const shouldDeleteShort = process.argv.includes('--delete-short');
  const allowDuplicates = process.argv.includes('--allow-duplicates');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : ARTICLE_DEFINITIONS.length;
  const targetArg = process.argv.find((a) => a.startsWith('--target-count='));
  const batchLabelArg = process.argv.find((a) => a.startsWith('--batch-label='));
  const batchLabel = batchLabelArg ? batchLabelArg.split('=')[1] : '';
  const ageMinArg = process.argv.find((a) => a.startsWith('--age-min='));
  const ageMaxArg = process.argv.find((a) => a.startsWith('--age-max='));
  const langArg = process.argv.find((a) => a.startsWith('--lang='));
  const typeArg = process.argv.find((a) => a.startsWith('--type='));

  const filteredDefs = ARTICLE_DEFINITIONS.filter((def) => {
    if (ageMinArg && def.age_min !== Number(ageMinArg.split('=')[1])) return false;
    if (ageMaxArg && def.age_max !== Number(ageMaxArg.split('=')[1])) return false;
    if (typeArg && def.type !== typeArg.split('=')[1]) return false;
    return true;
  });

  if (filteredDefs.length === 0) throw new Error('No article definitions match provided filters');

  const targetCount = targetArg ? Number(targetArg.split('=')[1]) : Math.min(limit, filteredDefs.length) * (langArg ? 1 : 2);

  if (shouldDeleteShort && pool) {
    await pool.query('delete from explore_articles where length(body) < 2000');
    console.log('Deleted short legacy articles (<2000 chars).');
  }

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; success < targetCount; i += 1) {
    const capped = Math.min(limit, filteredDefs.length);
    const langSequence = langArg ? [langArg.split('=')[1]] : ['es', 'en'];
    const langCount = langSequence.length;
    const defIndex = Math.floor(i / langCount) % capped;
    const def = filteredDefs[defIndex];
    const lang = langSequence[i % langCount];
    const title = lang === 'es' ? def.topic_es : def.topic;
    const variantIndex = Math.floor(i / (Math.min(limit, filteredDefs.length) * langCount)) + 1;
    const variantLabel = batchLabel ? `· ${batchLabel}-${variantIndex}` : variantIndex > 1 ? `· v${variantIndex}` : '';

    try {
      const canonicalTitle = `${title.charAt(0).toUpperCase() + title.slice(1)}${variantLabel ? ` ${variantLabel}` : ''}`;
      if (!allowDuplicates && (await exists(canonicalTitle, lang))) {
        console.log(`  - ${lang}: skip (${canonicalTitle})`);
        skipped += 1;
        continue;
      }

      console.log(`\n[${success + 1}/${targetCount}] ${lang} | ${def.age_min}-${def.age_max}m | ${def.domain_en}`);
      const body = await generateArticle(def, lang);
      const summary = generateSummary(body);
      const id = await saveArticle(def, lang, body, summary, variantLabel);
      console.log(`  + saved ${id} (${body.trim().split(/\s+/).length} words, ${estimateReadTime(body)} min)`);
      success += 1;
      await sleep(1200);
    } catch (e) {
      console.error(`  x ${lang}: ${e.message}`);
      errors += 1;
      await sleep(5000);
    }
  }

  console.log('\nDone.');
  console.log({ success, skipped, errors });

  if (pool) {
    const { rows } = await pool.query(`
      select language, count(*)::int as count, round(avg(length(body)))::int as avg_chars, round(avg(read_time_minutes))::int as avg_read
      from explore_articles
      group by language
      order by language
    `);
    console.table(rows);
    await pool.end();
  } else {
    const { data } = await supabase.from('explore_articles').select('language');
    const stats = (data ?? []).reduce((acc, row) => {
      acc[row.language] = (acc[row.language] ?? 0) + 1;
      return acc;
    }, {});
    console.log(stats);
  }
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
