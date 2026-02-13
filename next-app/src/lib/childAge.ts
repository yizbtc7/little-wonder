const MONTHS_PER_YEAR = 12;

export function getAgeInMonths(birthdate: string): number {
  const birth = new Date(birthdate);
  const now = new Date();

  const yearDiff = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  const dayDiff = now.getUTCDate() - birth.getUTCDate();

  let ageInMonths = yearDiff * MONTHS_PER_YEAR + monthDiff;
  if (dayDiff < 0) {
    ageInMonths -= 1;
  }

  return Math.max(ageInMonths, 0);
}

export function formatAgeLabel(ageInMonths: number): string {
  if (ageInMonths < MONTHS_PER_YEAR) {
    return `${ageInMonths} meses`;
  }

  const years = Math.floor(ageInMonths / MONTHS_PER_YEAR);
  const months = ageInMonths % MONTHS_PER_YEAR;

  if (months === 0) {
    return years === 1 ? '1 año' : `${years} años`;
  }

  const yearLabel = years === 1 ? '1 año' : `${years} años`;
  const monthLabel = months === 1 ? '1 mes' : `${months} meses`;
  return `${yearLabel} ${monthLabel}`;
}
