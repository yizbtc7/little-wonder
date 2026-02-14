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
  trajectory: { label: 'Trayectoria', emoji: '🚀', color: '#D4766A', bg: '#FFF0ED' },
  rotation: { label: 'Rotación', emoji: '🌀', color: '#8B6CAE', bg: '#EDE5F5' },
  enclosure: { label: 'Encerrar', emoji: '🏠', color: '#5A9E6F', bg: '#E8F5EE' },
  enveloping: { label: 'Envolver', emoji: '🎁', color: '#D4A574', bg: '#FFF8E0' },
  transporting: { label: 'Transportar', emoji: '🧺', color: '#A0895A', bg: '#FFF5E5' },
  connecting: { label: 'Conectar', emoji: '🔗', color: '#5A8AA0', bg: '#E5F0F8' },
  transforming: { label: 'Transformar', emoji: '🧪', color: '#8B6CAE', bg: '#EDE5F5' },
  positioning: { label: 'Posicionar', emoji: '📐', color: '#5A9E6F', bg: '#E8F5EE' },
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
