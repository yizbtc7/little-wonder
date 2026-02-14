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

export function pickUnreadSection(
  pool: ExploreArticle[],
  usedIds: Set<string>,
  min = 3,
  filter?: (a: ExploreArticle) => boolean
): { items: ExploreArticle[]; shortage: SectionShortage } {
  const eligible = filter ? pool.filter(filter) : pool;
  const unique = eligible.filter((a) => !usedIds.has(a.id));
  const picked = unique.slice(0, min);

  if (picked.length < min) {
    const existing = new Set(picked.map((a) => a.id));
    const topUp = eligible.filter((a) => !existing.has(a.id)).slice(0, min - picked.length);
    picked.push(...topUp);
  }

  for (const item of picked) usedIds.add(item.id);

  return {
    items: picked,
    shortage: {
      required: min,
      available_unread: eligible.length,
      returned: picked.length,
      shortage: Math.max(0, min - eligible.length),
    },
  };
}

export function normalizeLanguage(input: string | null | undefined, fallback: Language): Language {
  return input === 'en' || input === 'es' ? input : fallback;
}
