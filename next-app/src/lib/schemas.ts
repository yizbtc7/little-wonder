export const VALID_SCHEMA_KEYS = [
  'trajectory',
  'rotation',
  'enclosure',
  'enveloping',
  'transporting',
  'connecting',
  'transforming',
  'positioning',
] as const;

export type SchemaKey = (typeof VALID_SCHEMA_KEYS)[number];

export const SCHEMA_INFO: Record<SchemaKey, { label: string; emoji: string; color: string; bg: string }> = {
  trajectory: { label: 'Trayectoria', emoji: '➰', color: '#E8A090', bg: '#FDF1EE' },
  rotation: { label: 'Rotación', emoji: '🌀', color: '#C4B5D4', bg: '#F5F1FA' },
  enclosure: { label: 'Envolvimiento espacial', emoji: '📦', color: '#8FAE8B', bg: '#EEF6ED' },
  enveloping: { label: 'Envoltura', emoji: '🎁', color: '#E8C890', bg: '#FCF5E8' },
  transporting: { label: 'Transporte', emoji: '🧺', color: '#90B8E8', bg: '#EEF4FC' },
  connecting: { label: 'Conexión', emoji: '🔗', color: '#E89090', bg: '#FDEFEF' },
  transforming: { label: 'Transformación', emoji: '🧪', color: '#B890E8', bg: '#F4EEFC' },
  positioning: { label: 'Posicionamiento', emoji: '📐', color: '#90D4C4', bg: '#ECF9F5' },
};

const LEGACY_SCHEMA_MAP: Record<string, SchemaKey> = {
  trajectory: 'trajectory',
  trayectorias: 'trajectory',
  trayectoria: 'trajectory',
  throwing: 'trajectory',
  launching: 'trajectory',

  rotation: 'rotation',
  rotacion: 'rotation',
  rotación: 'rotation',
  rotating: 'rotation',
  spinning: 'rotation',

  enclosure: 'enclosure',
  enclose: 'enclosure',
  containing: 'enclosure',
  container: 'enclosure',
  encerrar: 'enclosure',

  enveloping: 'enveloping',
  envelope: 'enveloping',
  wrapping: 'enveloping',
  envolver: 'enveloping',

  transporting: 'transporting',
  transport: 'transporting',
  transporte: 'transporting',
  carrying: 'transporting',

  connecting: 'connecting',
  connection: 'connecting',
  conexion: 'connecting',
  conexión: 'connecting',
  linking: 'connecting',

  transforming: 'transforming',
  transformation: 'transforming',
  transformacion: 'transforming',
  transformación: 'transforming',
  mixing: 'transforming',

  positioning: 'positioning',
  position: 'positioning',
  posicionamiento: 'positioning',
  placing: 'positioning',
  ordering: 'positioning',
};

function sanitizeSchemaInput(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/schema/g, '')
    .replace(/esquema/g, '')
    .replace(/[^a-z\s_-]/g, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeSchemaKey(value: unknown): SchemaKey | null {
  if (typeof value !== 'string') return null;

  const clean = sanitizeSchemaInput(value);
  if (!clean) return null;

  const direct = LEGACY_SCHEMA_MAP[clean];
  if (direct) return direct;

  const collapsed = clean.replace(/\s+/g, '');
  const collapsedMatch = LEGACY_SCHEMA_MAP[collapsed];
  if (collapsedMatch) return collapsedMatch;

  return null;
}

export function normalizeSchemaList(values: unknown): SchemaKey[] {
  if (!Array.isArray(values)) return [];

  const deduped = new Set<SchemaKey>();
  for (const value of values) {
    const normalized = normalizeSchemaKey(value);
    if (normalized) deduped.add(normalized);
  }

  return Array.from(deduped);
}

export function isSchemaKey(value: unknown): value is SchemaKey {
  return normalizeSchemaKey(value) !== null;
}
