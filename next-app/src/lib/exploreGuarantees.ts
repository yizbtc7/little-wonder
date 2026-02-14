import type { Language } from '@/lib/translations';

export type ExploreArticle = {
  id: string;
  title: string;
  emoji: string;
  type: 'article' | 'research' | 'guide';
  summary: string | null;
  body: string;
  age_min_months: number;
  age_max_months: number;
  domain: string | null;
  language: Language;
  read_time_minutes: number | null;
  created_at: string;
};

export type SectionShortage = {
  required: number;
  available_unread: number;
  returned: number;
  shortage: number;
};

export function canonicalTitleKey(title: string): string {
  const base = title
    .replace(/\s*[·•]\s*refill-[^\n]+$/i, '')
    .replace(/\s*[·•]\s*v\d+$/i, '')
    .replace(/\s*[·•]\s*b\d+(?:-[\w-]+)?$/i, '')
    .replace(/\s+\d{10,}$/g, '')
    .trim()
    .toLowerCase();

  return base.replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
}

export function cleanArticleTitle(title: string): string {
  return title
    .replace(/\s*[·•]\s*refill-[^\n]+$/i, '')
    .replace(/\s*[·•]\s*v\d+$/i, '')
    .replace(/\s*[·•]\s*b\d+(?:-[\w-]+)?$/i, '')
    .replace(/\s+\d{10,}$/g, '')
    .trim();
}

export function dedupeByTitleKey(pool: ExploreArticle[]): ExploreArticle[] {
  const seen = new Set<string>();
  const out: ExploreArticle[] = [];
  for (const item of pool) {
    const key = canonicalTitleKey(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function pickUnreadSection(
  pool: ExploreArticle[],
  usedIds: Set<string>,
  min = 3,
  filter?: (a: ExploreArticle) => boolean
): { items: ExploreArticle[]; shortage: SectionShortage } {
  const eligible = filter ? pool.filter(filter) : pool;
  const unique = eligible.filter((a) => !usedIds.has(a.id));
  const picked = unique.slice(0, min);

  for (const item of picked) usedIds.add(item.id);

  return {
    items: picked,
    shortage: {
      required: min,
      available_unread: unique.length,
      returned: picked.length,
      shortage: Math.max(0, min - unique.length),
    },
  };
}

export function normalizeLanguage(input: string | null | undefined, fallback: Language): Language {
  return input === 'en' || input === 'es' ? input : fallback;
}
