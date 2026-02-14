/* eslint-disable no-console */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function canonicalTitle(title) {
  return title
    .toLowerCase()
    .replace(/\s*[·•]\s*refill-[^\n]+$/i, '')
    .replace(/\s*[·•]\s*b\d+(?:-[\w-]+)?(?:\s*\d+)?$/i, '')
    .replace(/\s*[·•]\s*v\d+$/i, '')
    .replace(/\s+\d{10,}$/, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleNoiseScore(title) {
  let score = 0;
  if (/refill-/i.test(title)) score += 100;
  if (/\bB\d/i.test(title)) score += 30;
  if (/·\s*v\d+/i.test(title)) score += 20;
  if (/\d{10,}/.test(title)) score += 15;
  score += Math.max(0, title.length - 90) / 10;
  return score;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  const { data, error } = await db
    .from('explore_articles')
    .select('id,title,language,age_min_months,age_max_months,type,created_at');

  if (error) throw error;

  const groups = new Map();

  for (const article of data ?? []) {
    const key = [article.language, article.age_min_months, article.age_max_months, article.type, canonicalTitle(article.title)].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(article);
  }

  const toDelete = [];

  for (const articles of groups.values()) {
    if (articles.length <= 1) continue;

    articles.sort((a, b) => {
      const scoreA = titleNoiseScore(a.title);
      const scoreB = titleNoiseScore(b.title);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    toDelete.push(...articles.slice(1).map((a) => a.id));
  }

  console.log(`Duplicate/similar rows found: ${toDelete.length}`);

  if (dryRun || toDelete.length === 0) {
    console.log(dryRun ? 'Dry run: no rows deleted.' : 'No duplicates to delete.');
    return;
  }

  const chunkSize = 200;
  for (let i = 0; i < toDelete.length; i += chunkSize) {
    const ids = toDelete.slice(i, i + chunkSize);
    const { error: deleteError } = await db.from('explore_articles').delete().in('id', ids);
    if (deleteError) throw deleteError;
  }

  const { count } = await db.from('explore_articles').select('*', { head: true, count: 'exact' });
  console.log(`Deleted ${toDelete.length}. Remaining explore_articles: ${count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
