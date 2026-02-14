import type { Language } from '@/lib/translations';

const MILESTONES = new Set([1, 5, 10, 20, 50]);

export function shouldRefreshCuriosityQuote(params: {
  streak: number;
  previousUpdatedAt?: string | null;
}): boolean {
  const { streak, previousUpdatedAt } = params;

  if (MILESTONES.has(streak)) return true;
  if (!previousUpdatedAt) return true;

  const last = new Date(previousUpdatedAt);
  if (Number.isNaN(last.getTime())) return true;

  const elapsedMs = Date.now() - last.getTime();
  return elapsedMs >= 7 * 24 * 60 * 60 * 1000;
}

export function buildCuriosityQuote(params: {
  childName: string;
  streak: number;
  locale: Language;
}): string {
  const { childName, streak, locale } = params;
  if (locale === 'es') {
    return `Día ${streak}: la curiosidad de ${childName} crece en cada momento pequeño que observas.`;
  }

  return `Day ${streak}: ${childName}'s curiosity grows through each small moment you notice.`;
}
