/* eslint-disable no-console */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const defs = require('./article-definitions');

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const CHUNK_SIZE = Number(process.env.REFILL_CHUNK_SIZE || 3);

function uniqueBands() {
  return [...new Map(defs.map((d) => [`${d.age_min}-${d.age_max}`, { age_min: d.age_min, age_max: d.age_max }])).values()];
}

function parseArg(name) {
  const hit = process.argv.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.split('=')[1] : null;
}

async function bandRows(language, band) {
  const { data, error } = await db
    .from('explore_articles')
    .select('emoji,title,type,domain,summary,body,read_time_minutes,age_min_months,age_max_months,language')
    .eq('language', language)
    .lte('age_min_months', band.age_min)
    .gte('age_max_months', band.age_max)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function cloneRows(rows, count, opts) {
  if (count <= 0) return;
  const payload = [];
  for (let i = 0; i < count; i += 1) {
    const seed = rows[i % rows.length];
    const now = Date.now();
    payload.push({
      emoji: seed.emoji,
      title: `${seed.title} · ${opts.label} ${i + 1} · ${now}`,
      type: opts.forceType || seed.type,
      domain: seed.domain,
      summary: seed.summary,
      body: seed.body,
      read_time_minutes: seed.read_time_minutes,
      age_min_months: seed.age_min_months,
      age_max_months: seed.age_max_months,
      language: opts.language,
    });
  }

  for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
    const chunk = payload.slice(i, i + CHUNK_SIZE);
    console.log(`Inserting chunk ${i / CHUNK_SIZE + 1}: ${chunk.length}`);
    const { error } = await db.from('explore_articles').insert(chunk);
    if (error) throw error;
  }
}

async function main() {
  const onlyLanguage = parseArg('--language');
  const onlyBand = parseArg('--band');
  const all = process.argv.includes('--all');

  const bands = uniqueBands();
  const selected = [];

  for (const language of ['es', 'en']) {
    if (onlyLanguage && language !== onlyLanguage) continue;
    for (const band of bands) {
      const bandKey = `${band.age_min}-${band.age_max}`;
      if (onlyBand && bandKey !== onlyBand) continue;
      const rows = await bandRows(language, band);
      const total = rows.length;
      const research = rows.filter((r) => r.type === 'research').length;

      const missingResearch = Math.max(0, 3 - research);
      const missingTotal = Math.max(0, 3 - total);

      if (missingResearch > 0 || missingTotal > 0) {
        selected.push({ language, band, bandKey, rows, missingResearch, missingTotal });
      }
    }
  }

  if (!all && selected.length > 1 && !onlyBand) selected.splice(1);

  console.log('\nShortages detected:');
  console.table(selected.map((s) => ({ language: s.language, band: s.bandKey, missingResearch: s.missingResearch, missingTotal: s.missingTotal })));

  for (const item of selected) {
    console.log(`\n=== Refill ${item.language} ${item.bandKey} ===`);
    const researchSeeds = item.rows.filter((r) => r.type === 'research');

    if (item.missingResearch > 0) {
      if (researchSeeds.length > 0) {
        await cloneRows(researchSeeds, item.missingResearch, { language: item.language, label: `refill-research-${item.bandKey}` });
      } else if (item.rows.length > 0) {
        await cloneRows(item.rows, item.missingResearch, { language: item.language, label: `refill-cast-research-${item.bandKey}`, forceType: 'research' });
      }
    }

    if (item.missingTotal > 0 && item.rows.length > 0) {
      await cloneRows(item.rows, item.missingTotal, { language: item.language, label: `refill-total-${item.bandKey}` });
    }

    const after = await bandRows(item.language, item.band);
    console.log(`After refill ${item.language} ${item.bandKey}: total=${after.length}, research=${after.filter((r) => r.type === 'research').length}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
