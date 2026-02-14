/* eslint-disable no-console */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('node:child_process');
const defs = require('./activity-definitions');

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function uniqueBands() {
  const bands = defs.AGE_BANDS || defs;
  return [...new Map(bands.map((d) => [`${d.age_min}-${d.age_max}`, { age_min: d.age_min, age_max: d.age_max }])).values()];
}

function parseArg(name) {
  const hit = process.argv.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.split('=')[1] : null;
}

async function bandRows(language, band) {
  const { data, error } = await db
    .from('activities')
    .select('id,title,schema_target,domain,age_min_months,age_max_months,language')
    .eq('language', language)
    .eq('age_min_months', band.age_min)
    .eq('age_max_months', band.age_max)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

function runGenerate(args) {
  const cmd = `node scripts/generate-activities.js ${args.join(' ')}`;
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

async function activeBandFromChildren() {
  const { data, error } = await db
    .from('children')
    .select('birthdate,created_at')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.birthdate) return null;

  const birth = new Date(data.birthdate);
  const now = new Date();
  let months = (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 + (now.getUTCMonth() - birth.getUTCMonth());
  if (now.getUTCDate() < birth.getUTCDate()) months -= 1;
  months = Math.max(0, months);

  const band = uniqueBands().find((b) => months >= b.age_min && months <= b.age_max);
  return band ? `${band.age_min}-${band.age_max}` : null;
}

async function main() {
  const onlyLanguage = parseArg('--language');
  const onlyBand = parseArg('--band');
  const all = process.argv.includes('--all');
  const threshold = Number(parseArg('--threshold') || 12);
  const proactiveTopUp = Number(parseArg('--proactive-topup') || 3);

  const bands = uniqueBands();
  const selected = [];

  for (const language of ['es', 'en']) {
    if (onlyLanguage && language !== onlyLanguage) continue;
    for (const band of bands) {
      const bandKey = `${band.age_min}-${band.age_max}`;
      if (onlyBand && bandKey !== onlyBand) continue;

      const rows = await bandRows(language, band);
      const total = rows.length;
      const uniqueDomains = new Set(rows.map((r) => r.domain).filter(Boolean)).size;
      const uniqueSchemas = new Set(rows.map((r) => r.schema_target).filter(Boolean)).size;

      const target = threshold + proactiveTopUp;
      const missingTotal = Math.max(0, target - total);
      const diversityWarning = uniqueDomains < 4 || uniqueSchemas < 3;

      if (missingTotal > 0 || diversityWarning) {
        selected.push({ language, band, bandKey, total, missingTotal, uniqueDomains, uniqueSchemas, diversityWarning });
      }
    }
  }

  const activeBand = await activeBandFromChildren();

  selected.sort((a, b) => {
    if (activeBand) {
      if (a.bandKey === activeBand && b.bandKey !== activeBand) return -1;
      if (b.bandKey === activeBand && a.bandKey !== activeBand) return 1;
    }
    return b.missingTotal - a.missingTotal;
  });

  if (!all && selected.length > 1 && !onlyBand) selected.splice(1);

  console.log('\nActivities shortages detected:');
  console.table(selected.map((s) => ({ language: s.language, band: s.bandKey, total: s.total, missingTotal: s.missingTotal, uniqueDomains: s.uniqueDomains, uniqueSchemas: s.uniqueSchemas, diversityWarning: s.diversityWarning })));

  for (const item of selected) {
    console.log(`\n=== Refill ${item.language} ${item.bandKey} ===`);

    if (item.missingTotal > 0) {
      runGenerate([
        `--lang=${item.language}`,
        `--age-min=${item.band.age_min}`,
        `--age-max=${item.band.age_max}`,
        `--target-count=${item.missingTotal}`,
        `--batch-label=refill-${item.bandKey}-${item.language}`,
      ]);
    }

    const after = await bandRows(item.language, item.band);
    console.log(`After refill ${item.language} ${item.bandKey}: total=${after.length}, domains=${new Set(after.map((r) => r.domain)).size}, schemas=${new Set(after.map((r) => r.schema_target)).size}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
