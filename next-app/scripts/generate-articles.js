/* eslint-disable no-console */
const Anthropic = require('@anthropic-ai/sdk').default;
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const ARTICLE_DEFINITIONS = require('./article-definitions');

if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY');
if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SYSTEM_PROMPT = `You are the editorial voice of Little Wonder, a curiosity companion app for parents.
Write warm, science-grounded long-form content (800-1200 words) with practical guidance.

Rules:
- Use markdown headings with ##
- Use {child_name} placeholder naturally
- Include specific researchers/findings in plain language
- Never use pathologizing language or child comparisons
- Never suggest expensive products
- Include sections:
  1) Hook
  2) Science explained with 3-4 sections
  3) What you can do (household items)
  4) What you don't need
  5) Memorable closing
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

async function generateSummary(body, lang) {
  const instruction =
    lang === 'es'
      ? 'Escribe un resumen de una sola oración (máx. 25 palabras), sorprendente y claro, en español.'
      : 'Write one single-sentence summary (max 25 words), clear and surprising, in English.';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 120,
    messages: [{ role: 'user', content: `${instruction}\n\nArticle:\n${body.slice(0, 2000)}` }],
  });

  return response.content[0].text.trim().replace(/^"|"$/g, '');
}

async function exists(title, lang) {
  const { rows } = await pool.query('select id from explore_articles where title = $1 and language = $2 limit 1', [title, lang]);
  return rows.length > 0;
}

async function saveArticle(def, lang, body, summary) {
  const title = lang === 'es' ? def.topic_es : def.topic;
  const domain = lang === 'es' ? def.domain_es : def.domain_en;
  const emoji = pickEmoji(def.domain_en);
  const readTime = estimateReadTime(body);

  const q = `
    insert into explore_articles
      (emoji, title, type, domain, summary, body, read_time_minutes, age_min_months, age_max_months, language)
    values
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    returning id
  `;

  const { rows } = await pool.query(q, [
    emoji,
    title.charAt(0).toUpperCase() + title.slice(1),
    def.type,
    domain,
    summary,
    body,
    readTime,
    def.age_min,
    def.age_max,
    lang,
  ]);

  return rows[0]?.id;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const shouldDeleteShort = process.argv.includes('--delete-short');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : ARTICLE_DEFINITIONS.length;

  if (shouldDeleteShort) {
    await pool.query('delete from explore_articles where length(body) < 2000');
    console.log('Deleted short legacy articles (<2000 chars).');
  }

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < Math.min(limit, ARTICLE_DEFINITIONS.length); i += 1) {
    const def = ARTICLE_DEFINITIONS[i];
    console.log(`\n[${i + 1}] ${def.age_min}-${def.age_max}m | ${def.domain_en}`);

    for (const lang of ['es', 'en']) {
      const title = lang === 'es' ? def.topic_es : def.topic;
      try {
        if (await exists(title.charAt(0).toUpperCase() + title.slice(1), lang)) {
          console.log(`  - ${lang}: skip (already exists)`);
          skipped += 1;
          continue;
        }

        const body = await generateArticle(def, lang);
        const summary = await generateSummary(body, lang);
        const id = await saveArticle(def, lang, body, summary);
        console.log(`  + ${lang}: saved ${id} (${body.trim().split(/\s+/).length} words, ${estimateReadTime(body)} min)`);
        success += 1;
        await sleep(1200);
      } catch (e) {
        console.error(`  x ${lang}: ${e.message}`);
        errors += 1;
        await sleep(5000);
      }
    }
  }

  console.log('\nDone.');
  console.log({ success, skipped, errors });

  const { rows } = await pool.query(`
    select language, count(*)::int as count, round(avg(length(body)))::int as avg_chars, round(avg(read_time_minutes))::int as avg_read
    from explore_articles
    group by language
    order by language
  `);
  console.table(rows);

  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
