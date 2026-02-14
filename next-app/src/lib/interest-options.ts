export const CHILD_INTEREST_OPTIONS = [
  '🎵 Music & sounds',
  '📦 Stacking & building',
  '🌊 Water play',
  '🐛 Animals & bugs',
  '📚 Books',
  '🏃 Movement & climbing',
  '🎨 Drawing & messy play',
  '🔧 How things work',
] as const;

export function getChildInterestOptions(locale: 'es' | 'en') {
  if (locale !== 'es') return [...CHILD_INTEREST_OPTIONS];

  return [
    '🎵 Música y sonidos',
    '📦 Apilar y construir',
    '🌊 Juego con agua',
    '🐛 Animales e insectos',
    '📚 Libros',
    '🏃 Movimiento y trepar',
    '🎨 Dibujo y juego sensorial',
    '🔧 Cómo funcionan las cosas',
  ] as const;
}
