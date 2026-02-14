import type { Language } from '@/lib/translations';

export function shouldRefreshCuriosityQuote(params: {
  previousUpdatedAt?: string | null;
}): boolean {
  const { previousUpdatedAt } = params;

  if (!previousUpdatedAt) return true;

  const last = new Date(previousUpdatedAt);
  if (Number.isNaN(last.getTime())) return true;

  const elapsedMs = Date.now() - last.getTime();
  return elapsedMs >= 7 * 24 * 60 * 60 * 1000;
}

export function buildCuriosityQuote(params: {
  childName: string;
  locale: Language;
}): string {
  const { childName, locale } = params;
  if (locale === 'es') {
    return `La curiosidad de ${childName} crece en cada momento pequeño que observas.`;
  }

  return `${childName}'s curiosity grows through each small moment you notice.`;
}
