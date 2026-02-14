'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import FadeUp from '@/components/ui/FadeUp';
import SoftButton from '@/components/ui/SoftButton';
import { DAILY_INSIGHT } from '@/data/daily-insights';
import { STAGE_CONTENT } from '@/data/stage-content';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { theme } from '@/styles/theme';
import { replaceChildName } from '@/utils/personalize';
import { translations, type Language } from '@/lib/translations';
import { SCHEMA_INFO, normalizeSchemaKey, normalizeSchemaList, type SchemaKey } from '@/lib/schemas';
import { CHILD_INTEREST_OPTIONS } from '@/lib/interest-options';
import { PARENT_ROLES } from '@/lib/parent-roles';
import ArticleReader from '@/components/article-reader/ArticleReader';

type WonderPayload = {
  title: string;
  article: {
    lead: string;
    pull_quote: string;
    signs: string[];
    how_to_be_present: string;
    curiosity_closer?: string;
  };
  schemas_detected?: string[];
};

type InsightPayload = {
  reply?: string;
  wonder?: WonderPayload | null;
};

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'ai'; insight: InsightPayload };

type ConversationSummary = {
  id: string;
  started_at: string;
  last_message_at: string;
  preview: string | null;
  wonder_count: number;
};

type ApiChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  wonder_id: string | null;
  created_at: string;
  is_read?: boolean;
  opened_at?: string | null;
  completed_at?: string | null;
};

type ExploreBrainCardRow = ExploreArticleRow;

type ExploreDailyTipRow = {
  id: string;
  language?: 'en' | 'es';
  article: {
    tip: string;
    why: string;
    source: string;
  };
  source?: string;
};

type ExploreArticleRow = {
  id: string;
  title: string;
  emoji: string;
  type: 'article' | 'research' | 'guide';
  summary?: string;
  body: string;
  age_min_months: number;
  age_max_months: number;
  domain: string | null;
  language: string;
  read_time_minutes?: number;
  created_at: string;
  is_read?: boolean;
  opened_at?: string | null;
  completed_at?: string | null;
  is_bookmarked?: boolean;
  bookmarked_at?: string | null;
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  schema_target: string;
  domain: string;
  duration_minutes: number;
  materials: string[];
  steps: string;
  science_note: string;
  age_min_months: number;
  age_max_months: number;
  language: string;
  created_at: string;
  is_featured?: boolean;
  is_saved?: boolean;
  is_completed?: boolean;
  saved_at?: string | null;
  completed_at?: string | null;
  rating?: number | null;
  note?: string | null;
};

type ProfileWonderTimelineEntry = {
  id: string;
  created_at: string;
  title: string;
  observation: string;
  schemas: string[];
};

type ProfileSchemaStat = {
  name: string;
  count: number;
};

type ChildProfilePayload = {
  child?: {
    id: string;
    name: string;
    birthdate: string | null;
    photo_url: string | null;
    curiosity_quote: string | null;
    curiosity_quote_updated_at: string | null;
    moments_count: number;
  };
  interests?: string[];
  schema_stats?: ProfileSchemaStat[];
  top_schema?: ProfileSchemaStat | null;
  top_schemas?: ProfileSchemaStat[];
  timeline?: ProfileWonderTimelineEntry[];
  recent_moments?: Array<{ id: string; title: string; observation: string; created_at: string; schemas?: string[] }>;
  savedArticles?: ExploreArticleRow[];
};

type Props = {
  parentName: string;
  parentRole?: string | null;
  childName: string;
  childAgeLabel: string;
  childBirthdate: string;
  childId: string;
  initialLanguage?: Language;
  initialDailyContent?: unknown;
};

function parseInsightPayload(raw: string): InsightPayload {
  const fallback: InsightPayload = {
    reply: raw,
    wonder: null,
  };

  const cleanJsonText = (input: string): string =>
    input
      .trim()
      .replace(/^`{3,}\s*json\s*/i, '')
      .replace(/^`{3,}\s*/i, '')
      .replace(/^json\s*/i, '')
      .replace(/`{3,}$/i, '')
      .trim();

  const parseCandidate = (input: string): Partial<InsightPayload> | null => {
    const cleanedInput = cleanJsonText(input);
    try {
      return JSON.parse(cleanedInput) as Partial<InsightPayload>;
    } catch {
      const match = cleanedInput.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return JSON.parse(match[0]) as Partial<InsightPayload>;
      } catch {
        return null;
      }
    }
  };

  const decode = (value: string): string => value.replaceAll('\\n', '\n').replaceAll('\\"', '"').trim();

  const salvageFromStructuredText = (input: string): InsightPayload | null => {
    const text = cleanJsonText(input);

    const replyMatch = text.match(/"reply"\s*:\s*"([\s\S]*?)"\s*,\s*"wonder"/);
    const titleMatch = text.match(/"title"\s*:\s*"([\s\S]*?)"/);
    const leadMatch = text.match(/"lead"\s*:\s*"([\s\S]*?)"\s*,\s*"pull_quote"/);
    const pullQuoteMatch = text.match(/"pull_quote"\s*:\s*"([\s\S]*?)"\s*,\s*"signs"/);
    const howToMatch = text.match(/"how_to_be_present"\s*:\s*"([\s\S]*?)"(?:\s*,\s*"curiosity_closer"|\s*\})/);
    const curiosityMatch = text.match(/"curiosity_closer"\s*:\s*"([\s\S]*?)"\s*(?:\}|,)/);

    const signsBlockMatch = text.match(/"signs"\s*:\s*\[([\s\S]*?)\]/);
    const signs = signsBlockMatch
      ? Array.from(signsBlockMatch[1].matchAll(/"([^"]+)"/g)).map((m) => decode(m[1]))
      : [];

    const schemasBlockMatch = text.match(/"schemas_detected"\s*:\s*\[([\s\S]*?)\]/);
    const schemas = schemasBlockMatch
      ? Array.from(schemasBlockMatch[1].matchAll(/"([^"]+)"/g)).map((m) => decode(m[1]))
      : [];

    const reply = replyMatch ? decode(replyMatch[1]) : '';
    const title = titleMatch ? decode(titleMatch[1]) : '';

    if (!reply && !title) return null;

    return {
      reply: reply || fallback.reply,
      wonder: title
        ? {
            title,
            article: {
              lead: leadMatch ? decode(leadMatch[1]) : '',
              pull_quote: pullQuoteMatch ? decode(pullQuoteMatch[1]) : '',
              signs,
              how_to_be_present: howToMatch ? decode(howToMatch[1]) : '',
              curiosity_closer: curiosityMatch ? decode(curiosityMatch[1]) : '',
            },
            schemas_detected: schemas,
          }
        : null,
    };
  };

  let parsed =
    parseCandidate(raw) ??
    parseCandidate(raw.replaceAll('\\"', '"').replaceAll('\\n', '\n').replaceAll('\\t', '\t'));

  if (!parsed) {
    return salvageFromStructuredText(raw) ?? fallback;
  }

  let parsedPayload: Partial<InsightPayload> = parsed;

  for (let i = 0; i < 3; i += 1) {
    if (typeof parsedPayload.reply !== 'string') break;
    const nested = parseCandidate(parsedPayload.reply) ?? parseCandidate(parsedPayload.reply.replaceAll('\\"', '"').replaceAll('\\n', '\n'));
    if (!nested) break;
    parsedPayload = { ...parsedPayload, ...nested };
  }

  const salvageLegacyNarrativeWonder = (input: string): InsightPayload | null => {
    const text = input.trim();
    const signsHeaderMatch = text.match(/(?:✨\s*)?(Lo reconocerás cuando|You'll recognize it when)\s*…?/i);
    const presenceHeaderMatch = text.match(/(?:🤲\s*)?(Cómo estar presente|How to be present)/i);

    if (!signsHeaderMatch && !presenceHeaderMatch) return null;

    const signsIndex = signsHeaderMatch?.index ?? -1;
    const presenceIndex = presenceHeaderMatch?.index ?? -1;
    const firstSectionIndex = [signsIndex, presenceIndex].filter((idx) => idx >= 0).sort((a, b) => a - b)[0] ?? text.length;

    const lead = text.slice(0, firstSectionIndex).trim();

    const signsBlock = signsHeaderMatch
      ? text
          .slice(signsIndex + signsHeaderMatch[0].length, presenceIndex > signsIndex ? presenceIndex : undefined)
          .trim()
      : '';

    const signs = Array.from(signsBlock.matchAll(/(?:^|\n)\s*\d+[\).\s-]+([\s\S]+?)(?=\n\s*\d+[\).\s-]+|$)/gm))
      .map((m) => m[1].replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    const howTo = presenceHeaderMatch
      ? text.slice(presenceIndex + presenceHeaderMatch[0].length).trim().split(/\n{2,}/)[0]?.trim() ?? ''
      : '';

    const firstSentence = lead.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)[0] ?? '';
    const titleBase = firstSentence.length >= 18 ? firstSentence : lead;
    const title = (titleBase || 'Wonder').slice(0, 90).trim();

    if (!lead && signs.length === 0 && !howTo) return null;

    return {
      reply: lead ? lead.slice(0, 220) : fallback.reply,
      wonder: {
        title,
        article: {
          lead,
          pull_quote: '',
          signs,
          how_to_be_present: howTo,
          curiosity_closer: '',
        },
        schemas_detected: [],
      },
    };
  };

  if (!parsedPayload.wonder && typeof parsedPayload.reply === 'string') {
    const salvaged = salvageFromStructuredText(parsedPayload.reply);
    if (salvaged?.wonder) {
      return salvaged;
    }

    const legacyNarrative = salvageLegacyNarrativeWonder(parsedPayload.reply);
    if (legacyNarrative?.wonder) {
      return legacyNarrative;
    }
  }

  const replyText = (parsedPayload.reply ?? '').toString().trim();
  const wonder = parsedPayload.wonder
    ? {
        ...parsedPayload.wonder,
        schemas_detected: normalizeSchemaList(parsedPayload.wonder.schemas_detected),
      }
    : null;

  return {
    reply: replyText.length > 0 ? replyText : fallback.reply,
    wonder,
  };
}

function withChildName(text: string, childName: string): string {
  return replaceChildName(text, childName).replaceAll('Leo', childName);
}

function serializeAssistantInsight(insight: InsightPayload): string {
  return JSON.stringify(insight);
}

function apiUrl(path: string): string {
  if (typeof window !== 'undefined') {
    return new URL(path, window.location.origin).toString();
  }
  return path;
}

function formatConversationDate(dateInput: string, locale: Language): string {
  const date = new Date(dateInput);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / 86400000);

  if (diffDays === 0) return locale === 'es' ? 'Hoy' : 'Today';
  if (diffDays === 1) return locale === 'es' ? 'Ayer' : 'Yesterday';

  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeMomentDate(dateInput: string, locale: Language): string {
  const date = new Date(dateInput);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.max(0, Math.round((startOfToday.getTime() - startOfTarget.getTime()) / 86400000));

  if (diffDays === 0) return locale === 'es' ? 'Hoy' : 'Today';
  if (diffDays === 1) return locale === 'es' ? 'Ayer' : 'Yesterday';

  return locale === 'es' ? `Hace ${diffDays} días` : `${diffDays} days ago`;
}

function formatSchemaLabel(value: string): string {
  const key = normalizeSchemaKey(value);
  return key ? SCHEMA_INFO[key].label : '';
}

function formatSchemaChipLabel(value: string): string {
  const key = normalizeSchemaKey(value);
  return key ? `${SCHEMA_INFO[key].emoji} ${SCHEMA_INFO[key].label}` : '';
}

const SPANISH_SCHEMA_FALLBACK: SchemaKey = 'connecting';

function looksSpanish(text: string): boolean {
  const value = text.toLowerCase();
  if (!value.trim()) return false;

  if (/[áéíóúñ¿¡]/.test(value)) return true;

  const spanishMarkers = [
    ' el ', ' la ', ' los ', ' las ', ' un ', ' una ', ' unos ', ' unas ',
    ' de ', ' del ', ' y ', ' en ', ' con ', ' para ', ' por ', ' que ',
    ' está ', ' esta ', ' hoy ', ' ayer ', ' mamá', ' papá', ' niño', ' niña',
  ];

  return spanishMarkers.some((marker) => value.includes(marker));
}

function looksEnglish(text: string): boolean {
  const value = text.toLowerCase();
  if (!value.trim()) return false;

  const englishMarkers = [
    ' the ', ' and ', ' with ', ' for ', ' to ', ' from ', ' is ', ' are ',
    ' today ', ' yesterday ', ' child ', ' baby ', ' mom ', ' dad ',
  ];

  return englishMarkers.some((marker) => value.includes(marker));
}

function pickRecentMomentBody(moment: { title?: string; observation?: string }, locale: Language): string {
  const observation = moment.observation?.trim() ?? '';
  const title = moment.title?.trim() ?? '';

  if (locale !== 'es') return observation || title || '';

  const candidates = [observation, title].filter(Boolean);
  if (candidates.length === 0) return '';

  const spanish = candidates.find((text) => looksSpanish(text));
  if (spanish) return spanish;

  const nonEnglish = candidates.find((text) => !looksEnglish(text));
  if (nonEnglish) return nonEnglish;

  return candidates[0];
}

function localizeKnownTimelinePrompt(text: string, locale: Language, childName: string): string {
  if (locale !== 'es') return text;

  const normalized = text
    .toLowerCase()
    .replace(/["“”]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const mappings: Array<{ needle: string; label: string }> = [
    { needle: 'pointed at something and said a new word', label: `${childName} señaló algo y dijo una palabra nueva` },
    { needle: 'keeps stacking and knocking down blocks', label: `${childName} apila bloques y luego los tumba` },
    { needle: 'had a big tantrum at the store', label: `${childName} tuvo una gran rabieta en la tienda` },
    { needle: 'was pretending to cook me dinner', label: `${childName} estaba jugando a cocinarme la cena` },
  ];

  const match = mappings.find((item) => normalized.includes(item.needle));
  return match ? match.label : text;
}

function formatExploreTypeLabel(type: ExploreArticleRow['type'], locale: Language): string {
  if (locale === 'es') {
    if (type === 'guide') return 'Guía práctica';
    if (type === 'research') return 'Investigación';
    return 'Artículo';
  }
  if (type === 'guide') return 'Practical Guide';
  if (type === 'research') return 'Research';
  return 'Article';
}

function getNewForYouAccent(type: ExploreArticleRow['type'], index: number): { strip: string; label: string } {
  if (type === 'guide') return { strip: '#8FAE8B', label: '#5A9E6F' };
  if (type === 'research') return { strip: '#C4B5D4', label: '#8B6CAE' };

  const articlePalette = [
    { strip: '#E8A090', label: '#D4766A' },
    { strip: '#E5B8A0', label: '#C78668' },
    { strip: '#D9A5B6', label: '#B56B86' },
  ];

  return articlePalette[index % articlePalette.length];
}

function getBrainDomainAccent(domain: string | null | undefined, index: number): { bg: string; color: string } {
  const key = (domain ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (key.includes('bienestar') || key.includes('emoc')) return { bg: '#FFF2E8', color: '#C27A5A' };
  if (key.includes('autonomia') || key.includes('identidad')) return { bg: '#EDE5F5', color: '#8B6CAE' };
  if (key.includes('social')) return { bg: '#E8F5EE', color: '#5A9E6F' };
  if (key.includes('leng')) return { bg: '#FFEFE8', color: '#D4766A' };
  if (key.includes('motor') || key.includes('cuerpo')) return { bg: '#E7F2FA', color: '#5A8AA0' };
  if (key.includes('cogn')) return { bg: '#ECE8FA', color: '#7C67B3' };

  const palette = [
    { bg: '#F7EFE8', color: '#8C7A6B' },
    { bg: '#EEE8F8', color: '#7E6AA8' },
    { bg: '#EAF4EC', color: '#5D8C68' },
    { bg: '#FBECE6', color: '#C07766' },
  ];

  const hashBase = key || String(index);
  let hash = 0;
  for (let i = 0; i < hashBase.length; i += 1) hash = (hash + hashBase.charCodeAt(i)) % 997;
  return palette[hash % palette.length];
}


function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

function formatInlineMarkdown(text: string): string {
  const escaped = text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function markdownToHtml(markdown: string): string {
  const normalized = markdown
    .replaceAll('\\n', '\n')
    .replaceAll('\\t', ' ')
    .replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const html: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) html.push('</ul>');
    if (inOl) html.push('</ol>');
    inUl = false;
    inOl = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeLists();
      continue;
    }

    if (trimmed.startsWith('### ')) {
      closeLists();
      html.push(`<h3>${formatInlineMarkdown(trimmed.slice(4))}</h3>`);
      continue;
    }

    if (trimmed.startsWith('## ')) {
      closeLists();
      html.push(`<h2>${formatInlineMarkdown(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inOl) {
        if (inUl) {
          html.push('</ul>');
          inUl = false;
        }
        html.push('<ol>');
        inOl = true;
      }
      html.push(`<li>${formatInlineMarkdown(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (!inUl) {
        if (inOl) {
          html.push('</ol>');
          inOl = false;
        }
        html.push('<ul>');
        inUl = true;
      }
      html.push(`<li>${formatInlineMarkdown(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
  }

  closeLists();
  return html.join('');
}

const schemaBadgeColors: Record<SchemaKey, string> = {
  trajectory: SCHEMA_INFO.trajectory.color,
  rotation: SCHEMA_INFO.rotation.color,
  enclosure: SCHEMA_INFO.enclosure.color,
  enveloping: SCHEMA_INFO.enveloping.color,
  transporting: SCHEMA_INFO.transporting.color,
  connecting: SCHEMA_INFO.connecting.color,
  transforming: SCHEMA_INFO.transforming.color,
  positioning: SCHEMA_INFO.positioning.color,
};

function schemaBadgeColor(schema: string): string {
  const key = normalizeSchemaKey(schema);
  return key ? schemaBadgeColors[key] : theme.colors.rose;
}

function schemaContextLine(schema: string, childName: string, locale: Language): string | null {
  const key = normalizeSchemaKey(schema);
  if (!key) return null;

  const mapEs: Record<SchemaKey, string> = {
    trajectory: `Porque a ${childName} le encanta lanzar y dejar caer cosas`,
    transporting: `Porque ${childName} transporta cosas de un lugar a otro`,
    rotation: `Porque a ${childName} le fascina lo que gira`,
    enclosure: `Porque a ${childName} le encanta meter cosas dentro de otras`,
    connecting: `Porque ${childName} quiere conectar y desconectar todo`,
    transforming: `Porque a ${childName} le encanta mezclar y transformar cosas`,
    positioning: `Porque ${childName} alinea todo con precisión`,
    enveloping: `Porque a ${childName} le encanta envolver y esconder cosas`,
  };

  const mapEn: Record<SchemaKey, string> = {
    trajectory: `Because ${childName} loves throwing and dropping things`,
    transporting: `Because ${childName} carries everything everywhere`,
    rotation: `Because ${childName} is fascinated by things that spin`,
    enclosure: `Because ${childName} loves putting things inside other things`,
    connecting: `Because ${childName} wants to connect and disconnect everything`,
    transforming: `Because ${childName} loves mixing and changing things`,
    positioning: `Because ${childName} lines everything up just right`,
    enveloping: `Because ${childName} loves hiding and wrapping things`,
  };

  return (locale === 'es' ? mapEs : mapEn)[key];
}


type SchemaStat = { key: SchemaKey; count: number };

function SchemaBarChart({ schemaStats, maxCount }: { schemaStats: SchemaStat[]; maxCount: number }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid #EEE2DF', boxShadow: '0 8px 18px rgba(103,80,74,0.06)', padding: '16px 12px 14px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 162, padding: '2px 2px 0' }}>
        {schemaStats.map(({ key, count }) => {
          const info = SCHEMA_INFO[key];
          const barHeight = maxCount > 0 ? 30 + (count / maxCount) * 70 : 30;
          return (
            <div key={key} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, color: info.color, lineHeight: 1, marginBottom: 8 }}>{count}</span>
              <div
                style={{
                  width: 52,
                  height: barHeight,
                  borderRadius: '22px 22px 8px 8px',
                  background: `linear-gradient(180deg, ${info.bg} 0%, ${info.color}30 100%)`,
                  border: `1px solid ${info.color}33`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
                  paddingTop: 20,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{info.emoji}</span>
              </div>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10.5, fontWeight: 700, color: '#938E97', marginTop: 8, textAlign: 'center', lineHeight: 1.1, minHeight: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                {info.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopSchemaCards({ schemaStats, childName, locale }: { schemaStats: SchemaStat[]; childName: string; locale: Language }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {schemaStats.slice(0, 2).map(({ key, count }) => {
        const info = SCHEMA_INFO[key];
        const contextLine = schemaContextLine(key, childName, locale);
        return (
          <div key={key} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${theme.colors.divider}`, padding: '13px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span
                  aria-hidden
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: info.bg,
                    border: `1px solid ${info.color}33`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 15, lineHeight: 1 }}>{info.emoji}</span>
                </span>
                <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 800, color: '#3E302C' }}>{info.label}</p>
              </div>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800, color: info.color, background: `${info.bg}`, borderRadius: 999, padding: '4px 10px', minWidth: 30, textAlign: 'center' }}>{`${count} veces`}</span>
            </div>
            {contextLine ? <p style={{ margin: '5px 0 0', fontFamily: "'Nunito', sans-serif", fontSize: 12, color: '#8E8891' }}>{contextLine}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

function SchemaGardenSection({ locale, childName, schemaStats, maxCount, emptyMessage }: { locale: Language; childName: string; schemaStats: SchemaStat[]; maxCount: number; emptyMessage: string }) {
  return (
    <div style={{ marginTop: 20, marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>🌱</span>
        <h3 style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 700, color: '#2D2B32', lineHeight: 1.2 }}>{locale === 'es' ? 'Jardín de esquemas' : 'Schema Garden'}</h3>
      </div>
      <p style={{ margin: '0 0 4px', fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: '#938E97', lineHeight: 1.32 }}>
        {locale === 'es' ? `Los patrones de exploración que ${childName} cultiva` : `${childName}'s strongest play patterns`}
      </p>
      <p style={{ margin: '0 0 12px', fontFamily: "'Nunito', sans-serif", fontSize: 11.5, color: '#A39DA6', lineHeight: 1.35 }}>
        {locale === 'es' ? 'Los esquemas son formas repetidas de jugar que muestran cómo está aprendiendo.' : 'Schemas are repeated play patterns that show how your child is learning.'}
      </p>

      {schemaStats.length === 0 ? (
        <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 13, color: theme.colors.lightText }}>{emptyMessage}</p>
      ) : (
        <>
          <SchemaBarChart schemaStats={schemaStats} maxCount={maxCount} />
          <TopSchemaCards schemaStats={schemaStats} childName={childName} locale={locale} />
        </>
      )}
    </div>
  );
}

function deserializeAssistantInsight(content: string): InsightPayload {
  return parseInsightPayload(content);
}

type Tab = 'chat' | 'explore' | 'activities' | 'profile';
type ProfileTab = 'overview' | 'timeline' | 'settings';

function getAgeMonths(birthdate: string): number {
  if (!birthdate) return 22;
  const now = new Date();
  const b = new Date(birthdate);
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  return Math.max(months, 0);
}

function normalizeParentRoleValue(role: string | null | undefined): string {
  const normalized = (role ?? '').trim().toLowerCase();
  if (normalized === 'mamá' || normalized === 'mama' || normalized === 'mom') return 'Mom';
  if (normalized === 'papá' || normalized === 'papa' || normalized === 'dad') return 'Dad';
  if (normalized === 'cuidador' || normalized === 'cuidadora' || normalized === 'caregiver') return 'Caregiver';
  if (normalized === 'otro' || normalized === 'other') return 'Other';
  return 'Mom';
}

function formatParentRole(role: string | null | undefined, locale: Language): string {
  const normalized = normalizeParentRoleValue(role);
  if (locale === 'es') {
    if (normalized === 'Mom') return 'Mamá';
    if (normalized === 'Dad') return 'Papá';
    if (normalized === 'Caregiver') return 'Cuidador/a';
    return 'Otro';
  }
  return normalized;
}

function dedupeArticleTitleKey(title: string): string {
  return title
    .replace(/\s*·\s*(?:ACT)?B\d+-[\w-]+$/i, '')
    .replace(/\s*\((?:ACT)?B\d+-[\w-]+\)$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function cleanActivityTitle(title: string): string {
  return title
    .replace(/\s*(?:[·•]\s*)?refill-[\w-]+(?:\s*\d+)?$/i, '')
    .replace(/\s*[·•]\s*refill-[^\n]+$/i, '')
    .replace(/\s*·\s*(?:ACT)?B\d+-[\w-]+$/i, '')
    .replace(/\s*\((?:ACT)?B\d+-[\w-]+\)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getQuickPrompts(ageMonths: number, childName: string, locale: Language): string[] {
  const es = locale === 'es';

  if (ageMonths <= 4) {
    return es
      ? [
          `🌀 ${childName} se queda mirando el ventilador del techo`,
          `😊 ${childName} sonrió cuando le hablé`,
          `🤏 ${childName} me agarró el dedo con fuerza`,
          `😢 ${childName} llora mucho y no logro saber por qué`,
        ]
      : [
          `🌀 ${childName} keeps staring at the ceiling fan`,
          `😊 ${childName} smiled when I talked`,
          `🤏 ${childName} grabbed my finger tightly`,
          `😢 ${childName} keeps crying and I can't tell why`,
        ];
  }

  if (ageMonths <= 8) {
    return es
      ? [
          `👶 ${childName} se mete todo a la boca`,
          `🙈 ${childName} se rió muchísimo con el cucú-tras`,
          `📱 ${childName} siempre quiere agarrar mi celular`,
          `😭 ${childName} lloró cuando lo/la cargó la abuela`,
        ]
      : [
          `👶 ${childName} puts everything in their mouth`,
          `🙈 ${childName} laughed so hard at peek-a-boo`,
          `📱 ${childName} keeps reaching for my phone`,
          `😭 ${childName} cried when grandma held them`,
        ];
  }

  if (ageMonths <= 14) {
    return es
      ? [
          `🍽️ ${childName} tira la comida desde la silla alta`,
          `📦 ${childName} mete cosas dentro de cajas`,
          `👋 ${childName} hoy se despidió con la mano`,
          `😣 ${childName} se frustró intentando alcanzar algo`,
        ]
      : [
          `🍽️ ${childName} keeps dropping food from the high chair`,
          `📦 ${childName} keeps putting things into boxes`,
          `👋 ${childName} waved bye-bye today`,
          `😣 ${childName} got frustrated trying to reach something`,
        ];
  }

  if (ageMonths <= 24) {
    return es
      ? [
          `🧱 ${childName} apila bloques y luego los tumba`,
          `🗣️ ${childName} señaló algo y dijo una palabra nueva`,
          `😤 ${childName} tuvo una gran rabieta en la tienda`,
          `🎭 ${childName} estaba jugando a cocinarme la cena`,
        ]
      : [
          `🧱 ${childName} keeps stacking and knocking down blocks`,
          `🗣️ ${childName} pointed at something and said a new word`,
          `😤 ${childName} had a big tantrum at the store`,
          `🎭 ${childName} was pretending to cook me dinner`,
        ];
  }

  if (ageMonths <= 48) {
    return es
      ? [
          `❓ ${childName} pregunta "¿por qué?" sin parar`,
          `✏️ ${childName} dibuja círculos y líneas todo el tiempo`,
          `🧸 ${childName} se enojó mucho cuando otro niño le quitó un juguete`,
          `🧚 ${childName} me habló de un amigo imaginario`,
        ]
      : [
          `❓ ${childName} keeps asking "why?" nonstop`,
          `✏️ ${childName} keeps drawing circles and lines`,
          `🧸 ${childName} got really upset when another kid took a toy`,
          `🧚 ${childName} told me about an imaginary friend`,
        ];
  }

  if (ageMonths <= 84) {
    return es
      ? [
          `📍 ${childName} intenta leer letreros en todas partes`,
          `🧱 ${childName} construyó una estructura de Lego muy compleja`,
          `💔 ${childName} me dijo "nadie quiere jugar conmigo"`,
          `🔧 ${childName} pregunta todo el tiempo cómo funcionan las cosas`,
        ]
      : [
          `📍 ${childName} is trying to read signs everywhere`,
          `🧱 ${childName} built an elaborate Lego structure`,
          `💔 ${childName} said "nobody wants to play with me"`,
          `🔧 ${childName} keeps asking how things work`,
        ];
  }

  return es
    ? [
        `📺 ${childName} solo quiere ver YouTube últimamente`,
        `📚 ${childName} está batallando con las tareas`,
        `🎮 ${childName} está obsesionado/a con un juego`,
        `🌌 ${childName} me hizo una pregunta súper profunda`,
      ]
    : [
        `📺 ${childName} only wants to watch YouTube lately`,
        `📚 ${childName} is struggling with homework`,
        `🎮 ${childName} is obsessed with one game`,
        `🌌 ${childName} asked me a really deep question`,
      ];
}

export default function ObserveFlow({ parentName, parentRole, childName, childAgeLabel, childBirthdate, childId, initialLanguage = 'es' }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState<'brain' | 'activity' | null>(null);
  const [signOutError, setSignOutError] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [inviteLinkError, setInviteLinkError] = useState<string>('');
  const [inviteLinkLoading, setInviteLinkLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [openWonder, setOpenWonder] = useState<WonderPayload | null>(null);
  const [exploreCards, setExploreCards] = useState<ExploreBrainCardRow[]>([]);
  const [exploreDailyTip, setExploreDailyTip] = useState<ExploreDailyTipRow | null>(null);
  const [newForYouArticles, setNewForYouArticles] = useState<ExploreArticleRow[]>([]);
  const [keepReadingArticles, setKeepReadingArticles] = useState<ExploreArticleRow[]>([]);
  const [deepDiveArticles, setDeepDiveArticles] = useState<ExploreArticleRow[]>([]);
  const [recentlyReadArticles, setRecentlyReadArticles] = useState<ExploreArticleRow[]>([]);
  const [comingNextArticles, setComingNextArticles] = useState<ExploreArticleRow[]>([]);
  const [savedArticles, setSavedArticles] = useState<ExploreArticleRow[]>([]);
  const [savedArticlesViewOrigin, setSavedArticlesViewOrigin] = useState<'explore' | 'profile' | null>(null);
  const [openExploreArticle, setOpenExploreArticle] = useState<ExploreArticleRow | null>(null);
  const [openArticleOriginTab, setOpenArticleOriginTab] = useState<'explore' | 'profile'>('explore');
  const [returnToSavedArticlesViewOnReaderBack, setReturnToSavedArticlesViewOnReaderBack] = useState(false);
  const [exploreStats, setExploreStats] = useState({ total_available: 0, total_read: 0 });
  const [showReadArticles, setShowReadArticles] = useState(false);
  const [showProfileBookmarks, setShowProfileBookmarks] = useState(false);
  const [showAllRecentMoments, setShowAllRecentMoments] = useState(false);
  const [articleReadPulse, setArticleReadPulse] = useState(false);
  const [openArticleProgress, setOpenArticleProgress] = useState(0);
  const [readerToast, setReaderToast] = useState('');
  const [activitiesToast, setActivitiesToast] = useState('');
  const [activityCompleting, setActivityCompleting] = useState(false);
  const [focusChatComposerIntent, setFocusChatComposerIntent] = useState(false);
  const [openActivityDetail, setOpenActivityDetail] = useState<ActivityItem | null>(null);
  const [activitiesFeatured, setActivitiesFeatured] = useState<ActivityItem | null>(null);
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);
  const [savedActivities, setSavedActivities] = useState<ActivityItem[]>([]);
  const [completedActivities, setCompletedActivities] = useState<ActivityItem[]>([]);
  const [activitiesStats, setActivitiesStats] = useState({ total: 0, completed: 0 });
  const [showCompletedActivities, setShowCompletedActivities] = useState(false);
  const [showProfileCompletedActivities, setShowProfileCompletedActivities] = useState(false);
  const [childSchemas, setChildSchemas] = useState<string[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [activitiesRetry, setActivitiesRetry] = useState(0);
  const [profileTimeline, setProfileTimeline] = useState<ProfileWonderTimelineEntry[]>([]);
  const [profileSchemaStats, setProfileSchemaStats] = useState<ProfileSchemaStat[]>([]);
  const [profileInterests, setProfileInterests] = useState<string[]>([]);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  const [interestError, setInterestError] = useState('');
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [profileRecentMoments, setProfileRecentMoments] = useState<Array<{ id: string; title: string; observation: string; created_at: string; schemas?: string[] }>>([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profilePhotoError, setProfilePhotoError] = useState<string>('');
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const [profileCuriosityQuote, setProfileCuriosityQuote] = useState<string>('');
  const [profileMomentsCount, setProfileMomentsCount] = useState(0);
  const [locale, setLocale] = useState<Language>(initialLanguage);
  const [settingsParentRole, setSettingsParentRole] = useState<string>(() => normalizeParentRoleValue(parentRole));
  const t = translations[locale];

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const exploreScrollRef = useRef<HTMLDivElement>(null);
  const profileScrollRef = useRef<HTMLDivElement>(null);
  const savedArticlesReturnScrollRef = useRef<number>(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const profileBookmarksRef = useRef<HTMLDivElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const completeOpenArticleReadRef = useRef<(() => void) | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (activeTab !== 'chat' || !focusChatComposerIntent) return;
    requestAnimationFrame(() => {
      textAreaRef.current?.focus();
      setFocusChatComposerIntent(false);
    });
  }, [activeTab, focusChatComposerIntent]);

  const prompts = useMemo(() => getQuickPrompts(getAgeMonths(childBirthdate), childName, locale), [childBirthdate, childName, locale]);

  const loadingMessages = [
    `Analyzing what ${childName} is exploring...`,
    'Connecting to developmental science...',
    'Preparing your insight...',
  ];

  const quoteOfTheDay = t.chat.quoteLine;
  const maxPhotoSizeBytes = 5 * 1024 * 1024;

  const DAILY_INSIGHT_ES = {
    tip: `Cuando leas con ${childName} esta noche, deja que pase las páginas, aunque se salte algunas.`,
    why: 'Cada vez que pasa una página toma una decisión. Ese pequeño acto entrena lenguaje, atención y autorregulación al mismo tiempo.',
  };

  const STAGE_CONTENT_ES = {
    cards: [
      {
        icon: '🎭',
        title: 'El teléfono banana y la mente de doble realidad',
        domain: 'Imaginación',
        color: '#F0EBF5',
        preview: `Cuando ${childName} usa una banana como teléfono, sostiene dos realidades a la vez: lo que ES y lo que REPRESENTA.`,
        full: {
          whats_happening: `En el cerebro de ${childName} está apareciendo algo enorme: la representación dual. Sabe que es una banana y al mismo tiempo decide que es un teléfono.`,
          youll_see_it_when: ['Da de comer a un peluche con una cuchara vacía', 'Habla por objetos como si fueran teléfonos', 'Arropa juguetes para "dormirlos"', 'Inventa sonidos para escenas de juego'],
          fascinating_part: 'El juego simbólico predice crecimiento de lenguaje y pensamiento abstracto.',
          how_to_be_present: 'Sigue su historia en vez de corregirla. Si la banana suena, contesta.',
        },
      },
      {
        icon: '💬',
        title: 'El diccionario invisible 5x',
        domain: 'Lenguaje',
        color: '#EDF5EC',
        preview: `${childName} entiende muchas más palabras de las que puede decir. Su cerebro está construyendo una biblioteca invisible.`,
        full: {
          whats_happening: `${childName} está en una ventana de lenguaje de alta velocidad. Con pocas palabras habladas, su comprensión crece con cada conversación significativa.`,
          youll_see_it_when: ['Sigue instrucciones complejas', 'Señala para pedir palabras', 'Usa una palabra para una idea completa', 'Balbuceo largo con ritmo conversacional'],
          fascinating_part: 'Los turnos conversacionales son de los predictores más fuertes del vocabulario futuro.',
          how_to_be_present: 'Cuando señale, nombra lo que ve y haz una pausa para que responda.',
        },
      },
      {
        icon: '✊',
        title: "Por qué decir 'no' es un avance",
        domain: 'Socioemocional',
        color: '#F8E8E0',
        preview: `Ese 'no' fuerte muchas veces es autonomía en desarrollo. ${childName} descubre que es una persona separada con preferencias.`,
        full: {
          whats_happening: `Cuando ${childName} dice no, está practicando agencia. Está organizando identidad, preferencia y límites.`,
          youll_see_it_when: ["'Yo solo' aunque tome más tiempo", 'Preferencias intensas por objetos', 'Dice no para probar elección', 'Resistencia en transiciones'],
          fascinating_part: 'Los sistemas de autonomía temprana sostienen luego control de impulsos y mejor toma de decisiones.',
          how_to_be_present: 'Ofrece opciones con límites claros y valida primero la emoción.',
        },
      },
    ],
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = (localStorage.getItem('locale') || localStorage.getItem('language') || '').toLowerCase();
    if (saved === 'en' || saved === 'es') {
      setLocale(saved);
    }
  }, []);

  useEffect(() => {
    setSettingsParentRole(normalizeParentRoleValue(parentRole));
  }, [parentRole]);

  useEffect(() => {
    autoResizeTextArea();
  }, [input]);

  useEffect(() => {
    if (!typing) {
      setTypingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setTypingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [typing, loadingMessages.length]);


  const personalizedCards = useMemo(() => {
    return exploreCards.map((article) => ({
      ...article,
      title: withChildName(article.title, childName),
      summary: withChildName(article.summary ?? '', childName),
      domain: article.domain ? withChildName(article.domain, childName) : article.domain,
    }));
  }, [childName, exploreCards]);

  const recentlyReadTitleKeys = useMemo(() => new Set(recentlyReadArticles.map((a) => dedupeArticleTitleKey(a.title))), [recentlyReadArticles]);

  const brainSectionCards = useMemo(() => {
    const unique = personalizedCards.filter(
      (card, index, all) => all.findIndex((candidate) => dedupeArticleTitleKey(candidate.title) === dedupeArticleTitleKey(card.title)) === index
    );
    return unique.filter((card) => !card.is_read && !recentlyReadTitleKeys.has(dedupeArticleTitleKey(card.title)));
  }, [personalizedCards, recentlyReadTitleKeys]);

  const newForYouSection = useMemo(() => {
    const used = new Set(brainSectionCards.map((c) => dedupeArticleTitleKey(c.title)));
    return newForYouArticles.filter((article) => {
      const key = dedupeArticleTitleKey(article.title);
      if (article.is_read || recentlyReadTitleKeys.has(key) || used.has(key)) return false;
      used.add(key);
      return true;
    });
  }, [brainSectionCards, newForYouArticles, recentlyReadTitleKeys]);

  const deepDiveSection = useMemo(() => {
    const used = new Set([...brainSectionCards, ...newForYouSection].map((c) => dedupeArticleTitleKey(c.title)));
    return deepDiveArticles.filter((article) => {
      const key = dedupeArticleTitleKey(article.title);
      if (article.is_read || recentlyReadTitleKeys.has(key) || used.has(key)) return false;
      used.add(key);
      return true;
    });
  }, [brainSectionCards, newForYouSection, deepDiveArticles, recentlyReadTitleKeys]);

  const moreForAgeSection = useMemo(() => {
    const used = new Set([...brainSectionCards, ...newForYouSection, ...deepDiveSection].map((c) => dedupeArticleTitleKey(c.title)));
    return [...keepReadingArticles, ...comingNextArticles].filter((article) => {
      const key = dedupeArticleTitleKey(article.title);
      if (article.is_read || recentlyReadTitleKeys.has(key) || used.has(key)) return false;
      used.add(key);
      return true;
    });
  }, [brainSectionCards, newForYouSection, deepDiveSection, keepReadingArticles, comingNextArticles, recentlyReadTitleKeys]);

  const schemaGardenSorted = useMemo<SchemaStat[]>(() => {
    const rollup = new Map<SchemaKey, number>();
    for (const stat of profileSchemaStats) {
      const key = normalizeSchemaKey(stat.name);
      if (!key) continue;
      rollup.set(key, (rollup.get(key) ?? 0) + stat.count);
    }

    return Array.from(rollup.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || SCHEMA_INFO[a.key].label.localeCompare(SCHEMA_INFO[b.key].label));
  }, [profileSchemaStats]);

  const schemaGardenMax = useMemo(() => {
    return schemaGardenSorted.reduce((max, item) => Math.max(max, item.count), 0);
  }, [schemaGardenSorted]);

  const hasSavedArticles = savedArticles.length > 0;
  const dailyGoalTarget = Math.min(3, exploreStats.total_available);
  const dailyGoalProgress = Math.min(exploreStats.total_read, dailyGoalTarget);
  const dailyGoalCompleted = dailyGoalTarget > 0 && dailyGoalProgress >= dailyGoalTarget;
  const weeklyActivitiesGoalTarget = 5;
  const weeklyActivitiesProgress = Math.min(activitiesStats.completed, weeklyActivitiesGoalTarget);
  const weeklyActivitiesGoalCompleted = weeklyActivitiesProgress >= weeklyActivitiesGoalTarget;

  const fetchConversations = async (): Promise<ConversationSummary[]> => {
    try {
      const response = await fetch(apiUrl('/api/conversations?limit=20'));
      if (!response.ok) return [];
      const payload = (await response.json()) as { conversations?: ConversationSummary[] };
      const list = payload.conversations ?? [];
      setConversations(list);
      return list;
    } catch {
      return [];
    }
  };

  const loadConversationMessages = async (id: string) => {
    const response = await fetch(apiUrl(`/api/conversations/${id}/messages`));
    if (!response.ok) return;
    const payload = (await response.json()) as { messages?: ApiChatMessage[] };
    const hydrated: ChatMessage[] = (payload.messages ?? []).map((message) =>
      message.role === 'user'
        ? { role: 'user', text: message.content }
        : { role: 'ai', insight: deserializeAssistantInsight(message.content) }
    );
    setConversationId(id);
    setMessages(hydrated);
    setShowSidebar(false);
  };

  useEffect(() => {
    if (activeTab !== 'chat') return;
    setConversationId(null);
    setMessages([]);
    void fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadExploreArticles = useCallback(async (excludedIds?: string[]) => {
    try {
      const excludeParam = excludedIds && excludedIds.length > 0 ? `&exclude=${encodeURIComponent(excludedIds.join(','))}` : '';
      const response = await fetch(apiUrl(`/api/explore/articles?language=${locale}${excludeParam}`));
      if (!response.ok) return;
      const payload = (await response.json()) as {
        new_for_you?: ExploreArticleRow[];
        keep_reading?: ExploreArticleRow[];
        deep_dives?: ExploreArticleRow[];
        recently_read?: ExploreArticleRow[];
        coming_next?: ExploreArticleRow[];
        stats?: { total_available?: number; total_read?: number };
      };
      setNewForYouArticles(payload.new_for_you ?? []);
      setKeepReadingArticles(payload.keep_reading ?? []);
      setDeepDiveArticles(payload.deep_dives ?? []);
      setRecentlyReadArticles(payload.recently_read ?? []);
      setComingNextArticles(payload.coming_next ?? []);
      setExploreStats({
        total_available: payload.stats?.total_available ?? 0,
        total_read: payload.stats?.total_read ?? 0,
      });
    } catch {
      // ignore fetch errors in non-browser test environments
    }
  }, [locale]);

  useEffect(() => {
    if (activeTab !== 'explore') return;
    setOpenExploreArticle(null);
    void (async () => {
      try {
        const exploreResponse = await fetch(apiUrl('/api/explore'));
        let brainIds: string[] = [];

        if (exploreResponse.ok) {
          const payload = (await exploreResponse.json()) as {
            brain_cards?: ExploreBrainCardRow[];
            daily_tip?: ExploreDailyTipRow | null;
          };
          setExploreCards(payload.brain_cards ?? []);
          setExploreDailyTip(payload.daily_tip ?? null);
          brainIds = (payload.brain_cards ?? []).map((card) => card.id);
        }

        await loadExploreArticles(brainIds);
      } catch {
        // ignore fetch errors in non-browser test environments
      }
    })();
  }, [activeTab, loadExploreArticles]);

  const loadSavedArticles = async () => {
    try {
      const response = await fetch(apiUrl('/api/explore/articles/bookmarked'));
      if (!response.ok) return;
      const payload = (await response.json()) as { articles?: ExploreArticleRow[] };
      setSavedArticles(payload.articles ?? []);
    } catch {
      // ignore in non-browser test environments
    }
  };

  useEffect(() => {
    if (activeTab !== 'explore' && activeTab !== 'profile') return;
    void loadSavedArticles();
  }, [activeTab]);

  useEffect(() => {
    const ids = new Set(savedArticles.map((item) => item.id));
    const withSavedFlag = (items: ExploreArticleRow[]) => items.map((item) => ({ ...item, is_bookmarked: ids.has(item.id) }));
    setNewForYouArticles((prev) => withSavedFlag(prev));
    setKeepReadingArticles((prev) => withSavedFlag(prev));
    setDeepDiveArticles((prev) => withSavedFlag(prev));
    setRecentlyReadArticles((prev) => withSavedFlag(prev));
    setComingNextArticles((prev) => withSavedFlag(prev));
    setOpenExploreArticle((prev) => (prev ? { ...prev, is_bookmarked: ids.has(prev.id) } : prev));
  }, [savedArticles]);

  const toggleArticleBookmark = async (articleId: string) => {
    const previousSaved = savedArticles;
    const articleCandidate = [openExploreArticle, ...newForYouArticles, ...deepDiveArticles, ...keepReadingArticles, ...recentlyReadArticles, ...comingNextArticles].find((item) => item?.id === articleId) ?? null;
    const currentlySaved = previousSaved.some((a) => a.id === articleId);

    const optimisticSaved = currentlySaved
      ? previousSaved.filter((item) => item.id !== articleId)
      : articleCandidate
        ? [{ ...articleCandidate, is_bookmarked: true, bookmarked_at: new Date().toISOString() }, ...previousSaved.filter((item) => item.id !== articleId)]
        : previousSaved;

    setSavedArticles(optimisticSaved);

    const updateCollection = (items: ExploreArticleRow[]) => items.map((item) => (item.id === articleId ? { ...item, is_bookmarked: !currentlySaved } : item));
    setNewForYouArticles(updateCollection);
    setDeepDiveArticles(updateCollection);
    setKeepReadingArticles(updateCollection);
    setRecentlyReadArticles(updateCollection);
    setComingNextArticles(updateCollection);
    setOpenExploreArticle((prev) => (prev?.id === articleId ? { ...prev, is_bookmarked: !currentlySaved } : prev));

    try {
      const response = await fetch(apiUrl(`/api/explore/articles/${articleId}/bookmark`), { method: 'POST' });
      if (!response.ok) throw new Error('bookmark_failed');
      const payload = (await response.json()) as { bookmarked?: boolean };
      if (typeof payload.bookmarked === 'boolean') {
        const finalSaved = payload.bookmarked
          ? optimisticSaved
          : optimisticSaved.filter((item) => item.id !== articleId);
        setSavedArticles(finalSaved);
      }
      setReaderToast(payload.bookmarked ? (locale === 'es' ? 'Guardado' : 'Saved') : (locale === 'es' ? 'Eliminado de guardados' : 'Removed from saved'));
      setTimeout(() => setReaderToast(''), 1400);
    } catch {
      setSavedArticles(previousSaved);
      const rollback = (items: ExploreArticleRow[]) => items.map((item) => (item.id === articleId ? { ...item, is_bookmarked: currentlySaved } : item));
      setNewForYouArticles(rollback);
      setDeepDiveArticles(rollback);
      setKeepReadingArticles(rollback);
      setRecentlyReadArticles(rollback);
      setComingNextArticles(rollback);
      setOpenExploreArticle((prev) => (prev?.id === articleId ? { ...prev, is_bookmarked: currentlySaved } : prev));
      setReaderToast(locale === 'es' ? 'No se pudo guardar' : 'Could not save');
      setTimeout(() => setReaderToast(''), 1600);
    }
  };

  const shareArticle = async (article: ExploreArticleRow) => {
    const shareUrl = `${window.location.origin}/shared/article/${article.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.title, url: shareUrl });
        setReaderToast(locale === 'es' ? 'Enlace compartido' : 'Shared');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setReaderToast(locale === 'es' ? 'Enlace copiado' : 'Link copied');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setReaderToast(locale === 'es' ? 'Enlace copiado' : 'Link copied');
      } catch {
        setReaderToast(locale === 'es' ? 'No se pudo compartir' : 'Could not share');
      }
    }
    setTimeout(() => setReaderToast(''), 1500);
  };

  const openSavedArticlesView = (origin: 'explore' | 'profile') => {
    const sourceRef = origin === 'explore' ? exploreScrollRef : profileScrollRef;
    savedArticlesReturnScrollRef.current = sourceRef.current?.scrollTop ?? 0;
    setSavedArticlesViewOrigin(origin);
    setActiveTab(origin);
    setReturnToSavedArticlesViewOnReaderBack(false);
  };

  const handleBackFromSavedArticlesView = () => {
    if (!savedArticlesViewOrigin) return;
    const origin = savedArticlesViewOrigin;
    const scrollTop = savedArticlesReturnScrollRef.current;
    setSavedArticlesViewOrigin(null);
    setReturnToSavedArticlesViewOnReaderBack(false);
    setActiveTab(origin);
    requestAnimationFrame(() => {
      const sourceRef = origin === 'explore' ? exploreScrollRef : profileScrollRef;
      sourceRef.current?.scrollTo({ top: scrollTop, behavior: 'auto' });
    });
  };

  const markArticleReadInCollection = (items: ExploreArticleRow[], articleId: string, completedAt: string) =>
    items.map((item) => (item.id === articleId ? { ...item, is_read: true, completed_at: completedAt } : item));

  useEffect(() => {
    if (!openExploreArticle) {
      completeOpenArticleReadRef.current = null;
      return;
    }

    const articleId = openExploreArticle.id;
    const article = openExploreArticle;
    const wasAlreadyRead = Boolean(article.is_read);
    const openedAtMs = Date.now();
    let completed = false;
    setOpenArticleProgress(0);

    void fetch(apiUrl(`/api/explore/articles/${articleId}/read`), { method: 'POST' });

    const maybeComplete = async () => {
      if (completed) return;
      completed = true;
      const elapsed = Math.max(1, Math.round((Date.now() - openedAtMs) / 1000));
      await fetch(apiUrl(`/api/explore/articles/${articleId}/read`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_completed: true, read_time_seconds: elapsed }),
      });
      const completedAt = new Date().toISOString();
      setArticleReadPulse(true);
      setTimeout(() => setArticleReadPulse(false), 1400);
      setNewForYouArticles((prev) => prev.filter((a) => a.id !== articleId));
      setKeepReadingArticles((prev) => prev.filter((a) => a.id !== articleId));
      setDeepDiveArticles((prev) => markArticleReadInCollection(prev, articleId, completedAt));
      setComingNextArticles((prev) => prev.filter((a) => a.id !== articleId));
      setSavedArticles((prev) => markArticleReadInCollection(prev, articleId, completedAt));
      setOpenExploreArticle((prev) => (prev?.id === articleId ? { ...prev, is_read: true, completed_at: completedAt } : prev));
      setRecentlyReadArticles((prev) => [{ ...article, is_read: true, completed_at: completedAt }, ...prev.filter((a) => a.id !== articleId)].slice(0, 10));
      if (!wasAlreadyRead) {
        setExploreStats((prev) => ({ ...prev, total_read: Math.min(prev.total_available, prev.total_read + 1) }));
      }
      setReaderToast(locale === 'es' ? '✅ Leído' : '✅ Read');
      setTimeout(() => setReaderToast(''), 1800);
      void loadExploreArticles();
    };

    completeOpenArticleReadRef.current = () => {
      void maybeComplete();
    };

    const timer = setTimeout(() => {
      void maybeComplete();
    }, 60000);

    return () => {
      completeOpenArticleReadRef.current = null;
      clearTimeout(timer);
      const elapsed = Math.max(1, Math.round((Date.now() - openedAtMs) / 1000));
      void fetch(apiUrl(`/api/explore/articles/${articleId}/read`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_completed: completed, read_time_seconds: elapsed }),
      });
    };
  }, [loadExploreArticles, openExploreArticle]);

  useEffect(() => {
    if (!openExploreArticle) return;
    if (openArticleProgress >= 0.9) {
      completeOpenArticleReadRef.current?.();
    }
  }, [openArticleProgress, openExploreArticle]);

  useEffect(() => {
    setActivitiesLoaded(false);
  }, [locale, childId]);

  useEffect(() => {
    if ((activeTab !== 'activities' && activeTab !== 'profile') || activitiesLoaded) return;
    void (async () => {
      try {
        const response = await fetch(apiUrl(`/api/activities?child_id=${childId}&language=${locale}`));
        if (!response.ok) {
          setTimeout(() => setActivitiesRetry((v) => v + 1), 1200);
          return;
        }

        const payload = (await response.json()) as {
          featured?: ActivityItem | null;
          activities?: ActivityItem[];
          saved?: ActivityItem[];
          completed?: ActivityItem[];
          stats?: { total: number; completed: number };
          child_schemas?: string[];
        };

        setActivitiesFeatured(payload.featured ?? null);
        setActivitiesList(payload.activities ?? []);
        setSavedActivities(payload.saved ?? []);
        setCompletedActivities(payload.completed ?? []);
        setActivitiesStats(payload.stats ?? { total: 0, completed: 0 });
        setChildSchemas(payload.child_schemas ?? []);
        setActivitiesLoaded(true);
      } catch {
        setTimeout(() => setActivitiesRetry((v) => v + 1), 1200);
      }
    })();
  }, [activeTab, activitiesLoaded, childId, locale, activitiesRetry]);

  useEffect(() => {
    if (activeTab !== 'profile') return;
    void (async () => {
      try {
        const response = await fetch(apiUrl(`/api/children/${childId}/profile`));
        if (!response.ok) return;
        const payload = (await response.json()) as ChildProfilePayload;
        setProfileTimeline(payload.timeline ?? []);
        setProfileSchemaStats(payload.schema_stats ?? []);
        setProfileInterests(payload.interests ?? []);
        setNewInterestInput('');
        setInterestError('');
        setShowInterestPicker(false);
        setProfileRecentMoments(payload.recent_moments ?? []);
        setProfilePhotoUrl(payload.child?.photo_url ?? null);
        setProfileCuriosityQuote(payload.child?.curiosity_quote ?? '');
        setProfileMomentsCount(payload.child?.moments_count ?? 0);
        setSavedArticles(payload.savedArticles ?? []);
      } catch {
        // ignore fetch errors in non-browser test environments
      }
    })();
  }, [activeTab, childId]);

  const normalizeInterestLabel = (value: string): string => value.trim().replace(/\s+/g, ' ');
  const hasLeadingEmoji = (value: string): boolean => /^\p{Extended_Pictographic}/u.test(value.trim());
  const interestComparableKey = (value: string): string =>
    normalizeInterestLabel(value)
      .replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, '')
      .toLocaleLowerCase('es-ES');
  const ensureInterestEmoji = (value: string): string => {
    const normalized = normalizeInterestLabel(value);
    if (!normalized) return normalized;
    return hasLeadingEmoji(normalized) ? normalized : `✨ ${normalized}`;
  };

  const submitNewInterest = async (interestValue?: string) => {
    const normalizedSource = interestValue ?? newInterestInput;
    const normalized = ensureInterestEmoji(normalizedSource);
    if (!normalized) return;

    const duplicateExists = profileInterests.some((value) => interestComparableKey(value) === interestComparableKey(normalized));
    if (duplicateExists) {
      setInterestError(locale === 'es' ? 'Ese interés ya está guardado.' : 'That interest is already saved.');
      return;
    }

    setIsAddingInterest(true);
    setInterestError('');

    try {
      const response = await fetch(apiUrl(`/api/children/${childId}/interests`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interest: normalized }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'interest_failed');
      }

      const payload = (await response.json()) as { interests?: string[] };
      setProfileInterests(payload.interests ?? profileInterests);
      setNewInterestInput('');
      setShowInterestPicker(false);
    } catch {
      setInterestError(locale === 'es' ? 'No pudimos guardar el interés.' : 'Could not save interest.');
    } finally {
      setIsAddingInterest(false);
    }
  };

  const toggleSaveActivity = async (activityId: string, isSaved: boolean) => {
    await fetch(apiUrl(`/api/activities/${activityId}/save`), { method: isSaved ? 'DELETE' : 'POST' });
    setActivitiesLoaded(false);
    setActivitiesRetry((v) => v + 1);
  };

  const completeActivity = async (activityId: string) => {
    if (activityCompleting) return;
    setActivityCompleting(true);

    const targetActivity = [activitiesFeatured, ...activitiesList, ...savedActivities, openActivityDetail].find((item) => item?.id === activityId) ?? null;

    try {
      const response = await fetch(apiUrl(`/api/activities/${activityId}/complete`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        setActivitiesToast(locale === 'es' ? 'No pudimos marcarla como hecha' : 'Could not mark as done');
        setTimeout(() => setActivitiesToast(''), 1800);
        setActivitiesLoaded(false);
        setActivitiesRetry((v) => v + 1);
        return;
      }

      const completedAt = new Date().toISOString();

      setActivitiesFeatured((prev) => (prev?.id === activityId ? null : prev));
      setActivitiesList((prev) => prev.filter((item) => item.id !== activityId));
      setSavedActivities((prev) => prev.filter((item) => item.id !== activityId));
      setCompletedActivities((prev) => {
        if (!targetActivity) return prev;
        const completedItem = { ...targetActivity, is_completed: true, completed_at: completedAt };
        return [completedItem, ...prev.filter((item) => item.id !== activityId)];
      });
      setActivitiesStats((prev) => ({
        ...prev,
        completed: Math.min(prev.total, prev.completed + 1),
      }));

      setOpenActivityDetail(null);
      setActivitiesToast(locale === 'es' ? '✅ Actividad completada' : '✅ Activity completed');
      setTimeout(() => setActivitiesToast(''), 1800);
      setActivitiesLoaded(false);
      setActivitiesRetry((v) => v + 1);
    } catch {
      setActivitiesToast(locale === 'es' ? 'No pudimos marcarla como hecha' : 'Could not mark as done');
      setTimeout(() => setActivitiesToast(''), 1800);
    } finally {
      setActivityCompleting(false);
    }
  };

  const ensureInviteLink = useCallback(async (): Promise<string | null> => {
    if (inviteLink) return inviteLink;
    if (inviteLinkLoading) return null;

    setInviteLinkLoading(true);
    setInviteLinkError('');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(apiUrl('/api/invites/create'), { method: 'POST', signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        setInviteLinkError(locale === 'es' ? 'No se pudo generar el enlace' : 'Could not generate invite link');
        return null;
      }
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!payload.url) {
        setInviteLinkError(locale === 'es' ? 'No se pudo generar el enlace' : 'Could not generate invite link');
        return null;
      }
      setInviteLink(payload.url);
      return payload.url;
    } catch {
      setInviteLinkError(locale === 'es' ? 'No se pudo generar el enlace' : 'Could not generate invite link');
      return null;
    } finally {
      setInviteLinkLoading(false);
    }
  }, [inviteLink, inviteLinkLoading, locale]);


  const copyInviteLink = async () => {
    const resolvedLink = (await ensureInviteLink()) ?? inviteLink;
    if (!resolvedLink) {
      setCopiedInviteLink(false);
      return;
    }

    try {
      await navigator.clipboard.writeText(resolvedLink);
      setCopiedInviteLink(true);
      setTimeout(() => setCopiedInviteLink(false), 1800);
    } catch {
      setCopiedInviteLink(false);
    }
  };

  useEffect(() => {
    if (profileTab !== 'settings') return;
    if (inviteLink || inviteLinkLoading || inviteLinkError) return;
    void ensureInviteLink();
  }, [profileTab, inviteLink, inviteLinkLoading, inviteLinkError, ensureInviteLink]);

  const openProfilePhotoPicker = () => {
    if (profilePhotoUploading) return;
    setProfilePhotoError('');
    profilePhotoInputRef.current?.click();
  };

  const uploadProfilePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const inputElement = event.target;
    const selectedFile = inputElement.files?.[0];

    if (!selectedFile) return;

    const isImage = selectedFile.type.startsWith('image/');
    if (!isImage) {
      setProfilePhotoError(locale === 'es' ? 'Por favor elige una imagen válida.' : 'Please choose a valid image file.');
      inputElement.value = '';
      return;
    }

    if (selectedFile.size > maxPhotoSizeBytes) {
      setProfilePhotoError(locale === 'es' ? 'La imagen es muy pesada. Máximo 5MB.' : 'Image is too large. Maximum size is 5MB.');
      inputElement.value = '';
      return;
    }

    setProfilePhotoUploading(true);
    setProfilePhotoError('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);

      const response = await fetch(apiUrl(`/api/children/${childId}/photo`), {
        method: 'POST',
        body: formData,
      });

      let payload: { error?: string; photo_url?: string } | null = null;
      try {
        payload = (await response.json()) as { error?: string; photo_url?: string };
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.photo_url) {
        throw new Error(payload?.error || 'upload_failed');
      }

      setProfilePhotoUrl(payload.photo_url);
    } catch (error) {
      const fallback = locale === 'es' ? 'No pudimos subir la foto. Inténtalo de nuevo.' : 'We could not upload the photo. Please try again.';
      const message = error instanceof Error && error.message && error.message !== 'upload_failed' ? error.message : fallback;
      setProfilePhotoError(message);
    } finally {
      setProfilePhotoUploading(false);
      inputElement.value = '';
    }
  };

  const ensureConversation = async (previewText: string): Promise<string | null> => {
    if (conversationId) return conversationId;

    const response = await fetch(apiUrl('/api/conversations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preview: previewText }),
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as { conversation?: { id: string } };
    const id = payload.conversation?.id ?? null;
    if (id) {
      setConversationId(id);
      await fetchConversations();
    }
    return id;
  };

  const autoResizeTextArea = () => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    el.style.overflowY = el.scrollHeight > 140 ? 'auto' : 'hidden';
  };

  const sendMessage = async (directText?: string) => {
    const text = (directText ?? input).trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    requestAnimationFrame(autoResizeTextArea);

    const convId = await ensureConversation(text);

    if (convId) {
      await fetch(apiUrl(`/api/conversations/${convId}/messages`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: text }),
      });
    }

    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observation: text }),
    });

    if (!response.ok || !response.body) {
      setTyping(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let raw = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
    }

    const parsed = parseInsightPayload(raw);
    setTyping(false);
    setMessages((prev) => [...prev, { role: 'ai', insight: parsed }]);
    if (parsed.wonder) {
      setActivitiesLoaded(false);
    }

    if (convId) {
      await fetch(apiUrl(`/api/conversations/${convId}/messages`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: serializeAssistantInsight(parsed) }),
      });
      await fetchConversations();
    }

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleSignOut = async () => {
    setSignOutError('');
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSignOutError(error.message);
      return;
    }
    window.location.href = '/';
  };

  const saveLanguage = async (nextLanguage: Language) => {
    setLocale(nextLanguage);
    localStorage.setItem('language', nextLanguage);
    localStorage.setItem('locale', nextLanguage);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('users').upsert({ id: user.id, language: nextLanguage });
    if (error) {
      setSettingsStatus(error.message);
      return;
    }
    setSettingsStatus(t.settings.saved);
    setTimeout(() => setSettingsStatus(''), 2000);
  };

  if (savedArticlesViewOrigin) {
    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px 12px', borderBottom: `1px solid ${theme.colors.divider}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <button
            type='button'
            onClick={handleBackFromSavedArticlesView}
            style={{ border: 'none', background: 'transparent', padding: 0, fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 800, color: theme.colors.roseDark, cursor: 'pointer' }}
          >
            {locale === 'es' ? '← Volver' : '← Back'}
          </button>
          <h1 style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: '#3E302C' }}>
            {locale === 'es' ? 'Artículos guardados' : 'Saved articles'}
          </h1>
          <span style={{ fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 800, color: '#A65E52', background: '#FFEDEA', borderRadius: 999, padding: '4px 9px', lineHeight: 1 }}>
            {savedArticles.length}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 20px' }}>
          {savedArticles.length === 0 ? (
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>
              {locale === 'es' ? 'Aún no hay artículos guardados.' : 'No saved articles yet.'}
            </p>
          ) : savedArticles.map((article) => {
            const badge = article.type === 'research'
              ? { label: locale === 'es' ? 'Investigación' : 'Research', bg: '#EFE7FA', color: '#7A5AA3' }
              : article.type === 'guide'
                ? { label: locale === 'es' ? 'Guía' : 'Guide', bg: '#E8F4EC', color: '#4F8E65' }
                : { label: locale === 'es' ? 'Artículo' : 'Article', bg: '#FFF0ED', color: '#C4685B' };
            const readTime = article.read_time_minutes ?? 6;
            const domainLabel = article.domain?.trim() || (locale === 'es' ? 'Crianza' : 'Parenting');

            return (
              <button
                key={`saved-full-${article.id}`}
                onClick={() => {
                  setOpenArticleOriginTab(savedArticlesViewOrigin);
                  setReturnToSavedArticlesViewOnReaderBack(true);
                  setOpenExploreArticle(article);
                }}
                style={{
                  width: '100%',
                  background: '#fff',
                  borderRadius: 16,
                  padding: '11px 12px',
                  marginBottom: 9,
                  border: '1px solid #ECE2DD',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                }}
              >
                <span style={{ width: 32, height: 32, borderRadius: 999, background: '#FFF4F0', border: '1px solid #F3DED7', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, lineHeight: 1 }}>
                  {article.emoji || '📚'}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 800, color: '#493A35', lineHeight: 1.28 }}>
                    {article.title}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, minWidth: 0, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 10.5, fontWeight: 800, color: badge.color, background: badge.bg, padding: '3px 8px', borderRadius: 999, lineHeight: 1 }}>
                      {badge.label}
                    </span>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 11.5, color: '#958782', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 118 }}>
                      {domainLabel}
                    </span>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 11.5, color: '#958782', whiteSpace: 'nowrap' }}>
                      · ☕ {readTime} min
                    </span>
                  </span>
                </span>
                <span style={{ flexShrink: 0, fontSize: 18, color: '#B39A93' }}>›</span>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  if ((activeTab === 'explore' || activeTab === 'profile') && openExploreArticle) {
    return (
      <ArticleReader
        article={openExploreArticle}
        childName={childName}
        childAgeLabel={childAgeLabel}
        locale={locale}
        isBookmarked={Boolean(openExploreArticle.is_bookmarked)}
        toastMessage={readerToast}
        onProgressChange={setOpenArticleProgress}
        onToggleBookmark={() => void toggleArticleBookmark(openExploreArticle.id)}
        onShare={() => void shareArticle(openExploreArticle)}
        onBack={() => {
          setOpenExploreArticle(null);
          if (returnToSavedArticlesViewOnReaderBack && savedArticlesViewOrigin) {
            setActiveTab(savedArticlesViewOrigin);
            return;
          }
          setActiveTab(openArticleOriginTab);
        }}
        onRegisterMoment={() => {
          setOpenExploreArticle(null);
          setSavedArticlesViewOrigin(null);
          setReturnToSavedArticlesViewOnReaderBack(false);
          setActiveTab('chat');
          setFocusChatComposerIntent(true);
        }}
      />
    );
  }

  return (
    <main style={{ position: 'relative', maxWidth: 390, margin: '0 auto', minHeight: '100vh', background: theme.colors.cream, boxShadow: '0 0 60px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
      {activeTab === 'chat' ? (
        <>
          {openWonder ? (
            <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: theme.colors.cream, overflowY: 'auto' }}>
              <div style={{ background: `linear-gradient(180deg, ${theme.colors.blush} 0%, ${theme.colors.cream} 100%)`, padding: '16px 24px 40px' }}>
                <button onClick={() => setOpenWonder(null)} style={{ border: 'none', borderRadius: 50, background: 'rgba(255,255,255,0.6)', padding: '8px 16px', cursor: 'pointer', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>← {locale === 'es' ? 'Volver al chat' : 'Back to chat'}</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{ background: theme.colors.blush, color: '#E8A090', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>✨ WONDER</span>
                  {(openWonder.schemas_detected ?? []).map((schema) => (
                    <span
                      key={schema}
                      style={{
                        background: '#FFFFFF',
                        color: '#8A8690',
                        border: '1px solid #F0EDE8',
                        fontFamily: theme.fonts.sans,
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 20,
                      }}
                    >
                      {formatSchemaLabel(schema)}
                    </span>
                  ))}
                </div>
                <h1 style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 30, lineHeight: 1.15, color: theme.colors.charcoal }}>{openWonder.title}</h1>
              </div>
              <div style={{ padding: '0 24px 40px' }}>
                <p style={{ margin: '0 0 24px', fontFamily: theme.fonts.sans, fontSize: 16, lineHeight: 1.75, color: theme.colors.darkText }}>{openWonder.article.lead}</p>
                {(openWonder.article.signs ?? []).filter((sign) => String(sign ?? '').trim()).length > 0 ? (
                  <>
                    <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.rose, textTransform: 'uppercase', letterSpacing: 0.8 }}>✨ {locale === 'es' ? 'Lo reconocerás cuando…' : 'You\'ll recognize it when…'}</p>
                    <div style={{ marginBottom: 32 }}>
                      {(openWonder.article.signs ?? []).map((rawSign, index) => {
                        const signText = String(rawSign ?? '').trim();
                        if (!signText) return null;

                        return (
                          <div key={index} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: theme.colors.blush, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: theme.colors.roseDark, flexShrink: 0, marginTop: 1 }}>{index + 1}</div>
                            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.6, color: theme.colors.darkText }}>{signText}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
                {String(openWonder.article.how_to_be_present ?? '').trim() ? (
                  <div style={{ background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.warmWhite} 100%)`, borderRadius: 24, padding: '24px 22px' }}>
                    <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.sage, textTransform: 'uppercase', letterSpacing: 0.8 }}>🤲 {locale === 'es' ? 'Cómo estar presente' : 'How to be present'}</p>
                    <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 16, lineHeight: 1.7, color: theme.colors.darkText }}>{openWonder.article.how_to_be_present}</p>
                  </div>
                ) : null}
                {openWonder.article.curiosity_closer ? (
                  <p style={{ margin: '28px 0 0', fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16, lineHeight: 1.6, color: '#C4756A', textAlign: 'center', padding: '0 8px' }}>{openWonder.article.curiosity_closer}</p>
                ) : null}
              </div>
            </div>
          ) : null}
          {showSidebar ? (
            <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex' }}>
              <div onClick={() => setShowSidebar(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
              <div style={{ position: 'relative', width: '82%', maxWidth: 320, background: theme.colors.cream, height: '100%', boxShadow: '4px 0 24px rgba(0,0,0,0.1)', padding: 16, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 20, fontWeight: 700, color: theme.colors.charcoal }}>Conversations</p>
                  <button onClick={() => setShowSidebar(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18 }}>✕</button>
                </div>
                <button
                  onClick={() => {
                    setConversationId(null);
                    setMessages([]);
                    setShowSidebar(false);
                  }}
                  style={{ width: '100%', marginBottom: 12, border: 'none', borderRadius: 14, background: theme.colors.charcoal, color: '#fff', padding: '12px 14px', fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  ✏️ New conversation
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => void loadConversationMessages(conversation.id)}
                      style={{ textAlign: 'left', borderRadius: 14, border: `1px solid ${conversation.id === conversationId ? theme.colors.blushMid : 'transparent'}`, background: conversation.id === conversationId ? theme.colors.blushLight : 'transparent', padding: '12px 14px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.lightText }}>
                          {formatConversationDate(conversation.last_message_at, locale)}
                        </span>
                        {conversation.wonder_count > 0 ? (
                          <span style={{ fontFamily: theme.fonts.sans, fontSize: 10, fontWeight: 700, color: theme.colors.roseDark }}>✨ {conversation.wonder_count}</span>
                        ) : null}
                      </div>
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.darkText, lineHeight: 1.4 }}>{conversation.preview || t.chat.newConversation}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${theme.colors.divider}`, background: theme.colors.cream }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setShowSidebar(true)} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: theme.colors.blushLight, cursor: 'pointer' }}>☰</button>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 16, fontWeight: 600, color: theme.colors.charcoal }}>Little Wonder</p>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.lightText }}>{locale === 'es' ? `compañero de curiosidad de ${childName}` : `${childName}'s curiosity companion`}</p>
              </div>
              {messages.length > 0 ? (
                <button
                  onClick={() => {
                    setConversationId(null);
                    setMessages([]);
                  }}
                  style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: theme.colors.blushLight, cursor: 'pointer' }}
                >
                  ✏️
                </button>
              ) : null}
            </div>
          </div>

          <div ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 48 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                <h2 style={{ margin: '0 0 8px', fontFamily: theme.fonts.serif, fontSize: 24, fontWeight: 600, color: theme.colors.charcoal }}>{t.chat.hi(parentName)}</h2>
                <p style={{ margin: '0 0 36px', fontFamily: theme.fonts.sans, fontSize: 15, color: theme.colors.midText, lineHeight: 1.5 }}>{t.chat.intro(childName)}</p>
                <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.lightText, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.chat.tryOne}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {prompts.map((prompt) => (
                    <button key={prompt} onClick={() => sendMessage(prompt.replace(/^\S+\s+/, ''))} style={{ background: '#fff', border: `1px solid ${theme.colors.divider}`, borderRadius: 18, padding: '12px 16px', textAlign: 'left', fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.darkText, cursor: 'pointer' }}>
                      {prompt}
                    </button>
                  ))}
                </div>
                <p style={{ margin: '26px auto 0', maxWidth: 300, fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16, color: theme.colors.lightText, textAlign: 'center', lineHeight: 1.55 }}>
                  {quoteOfTheDay}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.map((msg, idx) =>
                  msg.role === 'user' ? (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ background: theme.colors.charcoal, color: '#fff', borderRadius: '20px 20px 4px 20px', padding: '12px 16px', maxWidth: '80%', fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.5 }}>{msg.text}</div>
                    </div>
                  ) : (
                    <div key={idx} style={{ maxWidth: '92%' }}>
                      <>
                        <FadeUp delay={120}>
                          <div style={{ background: '#fff', borderRadius: '20px 20px 20px 4px', padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 10 }}>
                            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.7, color: theme.colors.darkText }}>{msg.insight.reply ?? ''}</p>
                          </div>
                        </FadeUp>
                        {msg.insight.wonder ? (
                          <FadeUp delay={240}>
                            <button
                              onClick={() => setOpenWonder(msg.insight.wonder ?? null)}
                              style={{ width: '100%', textAlign: 'left', border: `1.5px solid ${theme.colors.blushMid}`, borderRadius: 20, background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.warmWhite} 100%)`, padding: '18px 20px', cursor: 'pointer' }}
                            >
                              <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: theme.colors.roseDark, textTransform: 'uppercase', letterSpacing: 0.5 }}>✨ New Wonder</p>
                              <p style={{ margin: '0 0 10px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 700, color: theme.colors.charcoal }}>{msg.insight.wonder.title}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {(msg.insight.wonder.schemas_detected ?? []).map((schema) => (
                                    <span key={schema} style={{ fontSize: 11, color: theme.colors.roseDark, background: 'rgba(255,255,255,0.6)', padding: '3px 10px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 600 }}>
                                      {formatSchemaLabel(schema)}
                                    </span>
                                  ))}
                                </div>
                                <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, color: theme.colors.rose }}>Read →</span>
                              </div>
                            </button>
                          </FadeUp>
                        ) : null}
                      </>
                    </div>
                  )
                )}
                {typing ? (
                  <div style={{ padding: '12px 0' }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {[0, 1, 2].map((dot) => (
                        <div
                          key={dot}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            background: theme.colors.blushMid,
                            animation: `typingPulse 1.2s ease-in-out ${dot * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, fontStyle: 'italic', color: theme.colors.midText, transition: 'opacity 0.3s ease' }}>
                      {loadingMessages[typingMessageIndex]}
                    </p>
                    <style>{`@keyframes typingPulse { 0%, 100% { opacity: 0.3; transform: scale(0.8);} 50% { opacity: 1; transform: scale(1);} }`}</style>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${theme.colors.divider}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: '#fff', borderRadius: 24, padding: '10px 12px 10px 18px', border: `1.5px solid ${theme.colors.blushMid}` }}>
              <textarea
                ref={textAreaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResizeTextArea();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={t.chat.inputPlaceholder(childName)}
                rows={1}
                style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.45, maxHeight: 140, minHeight: 24, padding: '4px 0', background: 'transparent', overflowY: 'hidden' }}
              />
              <button onClick={() => void sendMessage()} disabled={!input.trim()} style={{ width: 36, height: 36, borderRadius: 18, border: 'none', background: input.trim() ? theme.colors.charcoal : theme.colors.blushMid, color: '#fff', cursor: input.trim() ? 'pointer' : 'default' }}>↑</button>
            </div>
          </div>
        </>
      ) : null}

      {activeTab === 'explore' ? (
        <div ref={exploreScrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
          <div style={{ padding: '20px 24px 0' }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 28, fontWeight: 700, color: '#2D2B32' }}>{t.learn.title}</h1>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, color: '#8A8690' }}>{t.learn.subtitle(childName)}</p>
            <div style={{ marginTop: 16, height: 1, background: '#F0EDE8' }} />
          </div>
          <div style={{ padding: '12px 16px 0' }}>
            {exploreStats.total_available === 0 && brainSectionCards.length === 0 && !exploreDailyTip ? (
              <div style={{ textAlign: 'center', padding: '40px 24px', background: `linear-gradient(135deg, ${theme.colors.blushLight} 0%, ${theme.colors.cream} 100%)`, borderRadius: 20, border: `1px dashed ${theme.colors.divider}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
                <p style={{ margin: '0 0 4px', fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 600, color: theme.colors.charcoal }}>Contenido en camino</p>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText, lineHeight: 1.5 }}>Estamos preparando artículos fascinantes sobre el desarrollo de {childName} a esta edad. ¡Vuelve pronto!</p>
              </div>
            ) : null}
            {!(exploreStats.total_available === 0 && brainSectionCards.length === 0 && !exploreDailyTip) ? (
            <>
            {exploreStats.total_available > 0 ? (
              <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: '#2D2B32' }}>📚 {locale === 'es' ? 'Meta de hoy' : "Today's goal"}</p>
                  <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, color: dailyGoalCompleted ? '#2E7D32' : '#8A8690', fontWeight: dailyGoalCompleted ? 700 : 500, whiteSpace: 'nowrap' }}>{dailyGoalCompleted ? (locale === 'es' ? `${exploreStats.total_read} leídos hoy` : `${exploreStats.total_read} read today`) : (locale === 'es' ? `${dailyGoalProgress} de ${dailyGoalTarget} leídos` : `${dailyGoalProgress} of ${dailyGoalTarget} read`)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 999, background: '#F0EDE8' }}>
                    <div style={{ width: `${dailyGoalTarget > 0 ? Math.round((dailyGoalProgress / dailyGoalTarget) * 100) : 0}%`, height: 8, borderRadius: 999, background: dailyGoalCompleted ? '#7FB98A' : '#E8A090' }} />
                  </div>
                </div>
              </div>
            ) : null}

            {savedArticles.length > 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0EDE8', padding: '14px 14px 8px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: '#2D2B32' }}>🔖 {locale === 'es' ? 'Guardados' : 'Saved'}</p>
                  <button onClick={() => openSavedArticlesView('explore')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: '#D4766A' }}>
                    {locale === 'es' ? `Ver todos (${savedArticles.length}) →` : `View all (${savedArticles.length}) →`}
                  </button>
                </div>
                {savedArticles.slice(0, 3).map((article) => (
                  <button key={`saved-preview-${article.id}`} onClick={() => { setOpenArticleOriginTab('explore'); setOpenExploreArticle(article); }} style={{ width: '100%', background: '#fff', borderRadius: 12, padding: '9px 10px', marginBottom: 8, border: '1px solid #F0EDE8', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: '#2D2B32', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</span>
                    <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {article.is_read ? <span style={{ fontFamily: theme.fonts.sans, fontSize: 10.5, fontWeight: 700, color: '#2E7D32', background: '#EAF7ED', padding: '3px 8px', borderRadius: 999, lineHeight: 1 }}>{t.learn.read}</span> : null}
                      <span style={{ fontSize: 14 }}>🔖</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {exploreDailyTip ? (
            <div style={{ background: 'linear-gradient(135deg, #F8E8E0 0%, #FFF5EE 100%)', borderRadius: 20, padding: '22px', marginBottom: 16, position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(232,160,144,0.08)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#D4956A' }}>🌟 {t.learn.todaysTip}</p>
              <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.6, color: '#2D2B32' }}>{withChildName(exploreDailyTip?.article?.tip ?? '', childName)}</p>
              </div>
            </div>
            ) : null}

            <h2 style={{ margin: '24px 4px 2px', fontFamily: theme.fonts.sans, fontSize: 18, fontWeight: 700, color: '#2D2B32' }}>🧠 {t.learn.insideBrain(childName)}</h2>
            <p style={{ margin: '0 4px 14px', fontFamily: theme.fonts.sans, fontSize: 13, color: '#8A8690' }}>{t.learn.whatHappeningNow}</p>
            {brainSectionCards.length === 0 ? (
              <div style={{ background: theme.colors.blushLight, borderRadius: 18, padding: '16px 14px', textAlign: 'center', marginBottom: 14 }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.midText }}>
                  {locale === 'es' ? `✨ ¡Estás al día! Aparecerán nuevos artículos mientras ${childName} crece.` : `✨ You're all caught up! New articles will appear as ${childName} grows.`}
                </p>
              </div>
            ) : (
              brainSectionCards.slice(0, 3).map((card, index) => {
                const accent = getBrainDomainAccent(card.domain, index);
                return (
                  <button key={card.id} onClick={() => { setOpenArticleOriginTab('explore'); setOpenExploreArticle(card); }} style={{ width: '100%', background: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 12, border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', gap: 14, textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: accent.bg, flexShrink: 0 }}>{card.emoji || '📚'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 700, color: '#2D2B32' }}>{card.title}</p>
                        <span style={{ fontSize: 11, fontFamily: theme.fonts.sans, fontWeight: 600, color: accent.color, background: accent.bg, padding: '3px 10px', borderRadius: 20 }}>{card.domain ?? t.learn.generalDomain}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontFamily: theme.fonts.sans, fontSize: 13, lineHeight: 1.5, color: '#8A8690', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{card.summary || card.body.slice(0, 160)}</p>
                      <p style={{ margin: '6px 0 0', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, color: '#E8A090' }}>📖 {card.read_time_minutes ?? 7} min</p>
                      {card.is_read ? <span style={{ display: 'inline-flex', marginTop: 8, fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: '#2E7D32', background: '#EAF7ED', padding: '3px 9px', borderRadius: 999 }}>{t.learn.read}</span> : null}
                    </div>
                  </button>
                );
              })
            )}

            <h2 style={{ margin: '28px 4px 14px', fontFamily: theme.fonts.sans, fontSize: 18, fontWeight: 700, color: '#2D2B32' }}>🆕 {t.learn.newForYou}</h2>
            {newForYouSection.length === 0 ? (
              <div style={{ background: theme.colors.blushLight, borderRadius: 18, padding: '16px 14px', textAlign: 'center', marginBottom: 14 }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.midText }}>{t.learn.allCaughtUp(childName)}</p>
                {comingNextArticles.length > 0 ? (
                  <p style={{ margin: '8px 0 0', fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText }}>{t.learn.upcomingLocked}</p>
                ) : null}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingLeft: 4, paddingBottom: 6, marginRight: -20, paddingRight: 20, marginBottom: 12, scrollbarWidth: 'none' as const, msOverflowStyle: 'none' as const }}>
                {newForYouSection.slice(0, 3).map((article, index) => {
                  const accent = getNewForYouAccent(article.type, index);
                  return (
                  <button key={article.id} onClick={() => { setOpenArticleOriginTab('explore'); setOpenExploreArticle(article); }} style={{ width: 220, flexShrink: 0, background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EDE8', textAlign: 'left', cursor: 'pointer', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ height: 6, background: accent.strip }} />
                    <div style={{ padding: '16px 16px 0', fontSize: 11, fontWeight: 600, fontFamily: theme.fonts.sans, textTransform: 'uppercase', color: accent.label }}>{formatExploreTypeLabel(article.type, locale)}</div>
                    <p style={{ margin: '6px 16px 0', fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 700, color: '#2D2B32', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</p>
                    {article.is_read ? <span style={{ display: 'inline-flex', margin: '8px 16px 0', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: '#2E7D32', background: '#EAF7ED', padding: '3px 9px', borderRadius: 999 }}>{t.learn.read}</span> : null}
                    <p style={{ margin: '10px 16px 16px', fontFamily: theme.fonts.sans, fontSize: 12, color: '#8A8690' }}>📖 {article.read_time_minutes ?? 7} min</p>
                  </button>
                );
                })}
              </div>
            )}


            {deepDiveSection.length > 0 ? (
              <>
                <h2 style={{ margin: '16px 4px 2px', fontFamily: theme.fonts.sans, fontSize: 18, fontWeight: 700, color: '#2D2B32' }}>🔬 {t.learn.deepDives}</h2>
                <p style={{ margin: '0 4px 10px', fontFamily: theme.fonts.sans, fontSize: 12, color: '#8A8690' }}>{locale === 'es' ? 'La ciencia detrás del desarrollo' : 'The science behind development'}</p>
                {deepDiveSection
                  .slice(0, 3)
                  .map((article) => (
                  <button key={`deep-${article.id}`} onClick={() => { setOpenArticleOriginTab('explore'); setOpenExploreArticle(article); }} style={{ width: '100%', background: '#fff', borderRadius: 16, padding: '12px 14px', marginBottom: 8, border: '1px solid #F0EDE8', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#EDE5F5' }}>{article.emoji}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: '#2D2B32', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: '#8B6CAE', background: '#EDE5F5', padding: '3px 10px', borderRadius: 20 }}>{locale === 'es' ? 'INVESTIGACIÓN' : 'RESEARCH'}</span>
                        {article.is_read ? <span style={{ fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: '#2E7D32', background: '#EAF7ED', padding: '3px 9px', borderRadius: 999 }}>{t.learn.read}</span> : null}
                        <span style={{ fontFamily: theme.fonts.sans, fontSize: 11, color: '#8A8690' }}>{article.read_time_minutes ?? 6} min</span>
                      </span>
                    </span>
                    <span style={{ color: '#B0ADB5' }}>›</span>
                  </button>
                ))}
              </>
            ) : null}

            {moreForAgeSection.length > 0 ? (
              <>
                <h2 style={{ margin: '16px 4px 10px', fontFamily: theme.fonts.sans, fontSize: 18, fontWeight: 700, color: '#2D2B32' }}>📚 {locale === 'es' ? 'Más artículos para esta edad' : 'More articles for this age'}</h2>
                {moreForAgeSection
                  .slice(0, 8)
                  .map((article) => (
                  <button key={`more-${article.id}`} onClick={() => { setOpenArticleOriginTab('explore'); setOpenExploreArticle(article); }} style={{ width: '100%', background: '#fff', borderRadius: 14, padding: '10px 12px', marginBottom: 8, border: '1px solid #F0EDE8', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: '#2D2B32', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</span>
                      {article.is_read ? <span style={{ fontFamily: theme.fonts.sans, fontSize: 10.5, fontWeight: 700, color: '#2E7D32', background: '#EAF7ED', padding: '2px 8px', borderRadius: 999, width: 'fit-content' }}>{t.learn.read}</span> : null}
                    </span>
                    <span style={{ marginLeft: 10, fontFamily: theme.fonts.sans, fontSize: 11, color: '#8A8690' }}>📖 {article.read_time_minutes ?? 7}m</span>
                  </button>
                ))}
              </>
            ) : null}

            <button onClick={() => setShowReadArticles((v) => !v)} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '8px 0', cursor: 'pointer' }}>
              <span style={{ fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.midText }}>{t.learn.articlesRead(recentlyReadArticles.length)} {showReadArticles ? '▾' : '▸'}</span>
            </button>
            {showReadArticles ? (
              <div>
                {recentlyReadArticles.map((article) => (
                  <button key={article.id} onClick={() => { setOpenArticleOriginTab('explore'); setOpenExploreArticle(article); }} style={{ width: '100%', background: '#fff', opacity: 0.85, borderRadius: 16, padding: '10px 12px', marginBottom: 8, border: `1px solid ${theme.colors.divider}`, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: theme.colors.darkText }}>{article.title}</span>
                    {article.is_read ? <span style={{ fontFamily: theme.fonts.sans, fontSize: 10.5, fontWeight: 700, color: '#2E7D32', background: '#EAF7ED', padding: '2px 8px', borderRadius: 999 }}>{t.learn.read}</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
            </>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeTab === 'activities' && openActivityDetail ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ background: `linear-gradient(180deg, ${theme.colors.lavenderBg} 0%, ${theme.colors.cream} 100%)`, padding: '16px 24px 36px' }}>
            <button onClick={() => setOpenActivityDetail(null)} style={{ background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 50, padding: '8px 16px', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, color: theme.colors.darkText, cursor: 'pointer', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22 }}>
              <span style={{ fontSize: 14 }}>←</span> Back
            </button>

            <div style={{ width: 88, height: 88, borderRadius: 44, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, background: theme.colors.blush }}>
              {openActivityDetail.emoji}
            </div>
            <h1 style={{ fontFamily: theme.fonts.serif, fontSize: 28, color: theme.colors.charcoal, margin: '0 0 8px', fontWeight: 700, lineHeight: 1.15, textAlign: 'center' }}>{withChildName(cleanActivityTitle(openActivityDetail.title), childName)}</h1>
            <p style={{ fontFamily: theme.fonts.sans, fontSize: 16, color: theme.colors.midText, margin: 0, textAlign: 'center' }}>{withChildName(openActivityDetail.subtitle, childName)}</p>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: theme.colors.midText, background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 600 }}>⏱ {openActivityDetail.duration_minutes} min</span>
              <span style={{ fontSize: 11, color: '#fff', background: schemaBadgeColor(openActivityDetail.schema_target), padding: '4px 12px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{formatSchemaLabel(openActivityDetail.schema_target)}</span>
              <span style={{ fontSize: 11, color: theme.colors.midText, background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{openActivityDetail.domain}</span>
            </div>
          </div>

          <div style={{ padding: '0 24px 40px' }}>
            <p style={{ fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.rose, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 }}>🏠 What you need</p>
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 24, border: `1px solid ${theme.colors.divider}` }}>
              {openActivityDetail.materials.map((material, index) => (
                <div key={material + index} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: index < openActivityDetail.materials.length - 1 ? 10 : 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: theme.colors.sage, flexShrink: 0 }} />
                  <p style={{ fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.darkText, margin: 0 }}>{material}</p>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: theme.fonts.sans, fontSize: 16, lineHeight: 1.7, color: theme.colors.darkText, marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: markdownToHtml(withChildName(openActivityDetail.steps, childName)) }} />

            <div style={{ background: theme.colors.lavenderBg, borderRadius: 24, padding: '18px 18px', marginBottom: 100 }}>
              <p style={{ fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.roseDark, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.8 }}>🧠 {locale === 'es' ? 'La ciencia detrás' : 'The science behind this'}</p>
              <p style={{ fontFamily: theme.fonts.sans, fontSize: 15, color: theme.colors.darkText, margin: 0, lineHeight: 1.65 }}>{withChildName(openActivityDetail.science_note, childName)}</p>
            </div>
          </div>

          <div style={{ position: 'sticky', bottom: 0, padding: '10px 16px 14px', background: 'rgba(255,251,247,0.94)', borderTop: `1px solid ${theme.colors.divider}`, backdropFilter: 'blur(10px)', display: 'grid', gap: 8 }}>
            <button disabled={activityCompleting} onClick={() => void completeActivity(openActivityDetail.id)} style={{ border: 'none', borderRadius: 14, padding: '12px 16px', background: theme.colors.sage, color: '#fff', fontFamily: theme.fonts.sans, fontWeight: 700, cursor: activityCompleting ? 'not-allowed' : 'pointer', opacity: activityCompleting ? 0.7 : 1 }}>
              ✅ {activityCompleting ? (locale === 'es' ? 'Guardando...' : 'Saving...') : (locale === 'es' ? '¡Lo hicimos!' : 'We did it!')}
            </button>
            <button onClick={() => void toggleSaveActivity(openActivityDetail.id, Boolean(openActivityDetail.is_saved))} style={{ border: `1px solid ${theme.colors.divider}`, borderRadius: 14, padding: '12px 16px', background: '#fff', color: theme.colors.darkText, fontFamily: theme.fonts.sans, fontWeight: 700, cursor: 'pointer' }}>
              {openActivityDetail.is_saved ? '🔖 ' : '📑 '} {locale === 'es' ? 'Guardar para después' : 'Save for later'}
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === 'activities' && !openActivityDetail ? (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
          <div style={{ padding: '20px 20px 18px', borderBottom: `1px solid ${theme.colors.divider}` }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 28, fontWeight: 700, color: theme.colors.charcoal }}>{t.activities.title}</h1>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.lightText }}>{t.activities.subtitle(childName)}</p>
            {activitiesStats.total > 0 ? (
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 14, background: '#fff', border: `1px solid ${theme.colors.divider}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: '#2D2B32' }}>✅ {locale === 'es' ? 'Actividades de la semana' : 'Activities of the week'}</p>
                  <span style={{ fontFamily: theme.fonts.sans, fontSize: 12, color: weeklyActivitiesGoalCompleted ? '#2E7D32' : theme.colors.midText, fontWeight: 700 }}>
                    {weeklyActivitiesGoalCompleted ? (locale === 'es' ? '✅ Meta de la semana completada' : '✅ Weekly goal completed') : `${weeklyActivitiesProgress}/${weeklyActivitiesGoalTarget}`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 6, background: theme.colors.divider, borderRadius: 10 }}>
                    <div style={{ width: `${Math.round((weeklyActivitiesProgress / weeklyActivitiesGoalTarget) * 100)}%`, height: 6, borderRadius: 10, background: weeklyActivitiesGoalCompleted ? '#7FB98A' : `linear-gradient(90deg, ${theme.colors.sage}, ${theme.colors.sage})` }} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div style={{ padding: '20px 20px 0' }}>
            {activitiesFeatured ? (
              <div onClick={() => setOpenActivityDetail(activitiesFeatured)} style={{ background: `linear-gradient(135deg, #E8E0F0 0%, ${theme.colors.warmWhite} 100%)`, borderRadius: 32, padding: '24px 22px', marginBottom: 20, cursor: 'pointer', border: '1.5px solid #D8D0E8', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: theme.colors.roseDark, background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>🎯 {locale === 'es' ? `Hecho para ${childName}` : `Made for ${childName}`}</span>
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{activitiesFeatured.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 700, color: theme.colors.charcoal, margin: '0 0 4px', lineHeight: 1.25 }}>{withChildName(cleanActivityTitle(activitiesFeatured.title), childName)}</h3>
                    <p style={{ fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText, margin: '0 0 10px', lineHeight: 1.4, fontStyle: 'italic' }}>{childSchemas.includes(activitiesFeatured.schema_target) ? schemaContextLine(activitiesFeatured.schema_target, childName, locale) ?? withChildName(activitiesFeatured.subtitle, childName) : withChildName(activitiesFeatured.subtitle, childName)}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: theme.colors.midText, background: 'rgba(255,255,255,0.6)', padding: '3px 10px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 600 }}>⏱ {activitiesFeatured.duration_minutes} min</span>
                      <span style={{ fontSize: 11, color: '#fff', background: schemaBadgeColor(activitiesFeatured.schema_target), padding: '3px 10px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{formatSchemaLabel(activitiesFeatured.schema_target)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <h2 style={{ fontFamily: theme.fonts.serif, fontSize: 18, color: theme.colors.charcoal, margin: '0 0 12px', fontWeight: 600 }}>{t.activities.moreToTry}</h2>
            {!activitiesFeatured && activitiesList.length === 0 ? (
              <div style={{ background: theme.colors.blushLight, borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.midText }}>{t.activities.emptyState}</p>
              </div>
            ) : null}
            {activitiesList.map((activity, idx) => {
              const iconBackgrounds = [theme.colors.lavenderBg, theme.colors.sageBg, theme.colors.blush, '#FDF5E6'];
              return (
                <div key={activity.id} onClick={() => setOpenActivityDetail(activity)} style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', border: `1px solid ${theme.colors.divider}`, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: iconBackgrounds[idx % iconBackgrounds.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{activity.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 700, color: theme.colors.darkText, margin: '0 0 3px' }}>{withChildName(cleanActivityTitle(activity.title), childName)}</h4>
                    <p style={{ fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.midText, margin: '0 0 6px', lineHeight: 1.4 }}>{childSchemas.includes(activity.schema_target) ? schemaContextLine(activity.schema_target, childName, locale) ?? withChildName(activity.subtitle, childName) : withChildName(activity.subtitle, childName)}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: theme.colors.lightText, fontFamily: theme.fonts.sans }}>⏱ {activity.duration_minutes} min</span>
                      <span style={{ fontSize: 10, color: '#fff', background: schemaBadgeColor(activity.schema_target), padding: '2px 8px', borderRadius: 10, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{formatSchemaLabel(activity.schema_target)}</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); void toggleSaveActivity(activity.id, Boolean(activity.is_saved)); }} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', opacity: 0.9 }}>
                    {activity.is_saved ? '🔖' : '📑'}
                  </button>
                </div>
              );
            })}

            {savedActivities.length > 0 ? (
              <>
                <h2 style={{ fontFamily: theme.fonts.serif, fontSize: 18, color: theme.colors.charcoal, margin: '14px 0 10px', fontWeight: 600 }}>🔖 {locale === 'es' ? 'Guardadas' : 'Saved'}</h2>
                {savedActivities.map((activity) => (
                  <div key={`saved-${activity.id}`} onClick={() => setOpenActivityDetail(activity)} style={{ background: '#fff', borderRadius: 16, padding: '12px 14px', marginBottom: 8, border: `1px solid ${theme.colors.divider}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: theme.colors.darkText }}>{withChildName(cleanActivityTitle(activity.title), childName)}</span>
                    <span style={{ fontSize: 16 }}>🔖</span>
                  </div>
                ))}
              </>
            ) : null}

            {completedActivities.length > 0 ? (
              <>
                <button onClick={() => setShowCompletedActivities((v) => !v)} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '10px 0', fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.midText, fontWeight: 700, cursor: 'pointer' }}>
                  ✅ {completedActivities.length} {locale === 'es' ? 'completadas' : 'completed'} {showCompletedActivities ? '▾' : '▸'}
                </button>
                {showCompletedActivities ? completedActivities.map((activity) => (
                  <div key={`completed-${activity.id}`} onClick={() => setOpenActivityDetail(activity)} style={{ background: '#fff', borderRadius: 16, padding: '12px 14px', marginBottom: 8, border: `1px solid ${theme.colors.divider}`, cursor: 'pointer', opacity: 0.75, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: theme.colors.darkText }}>{withChildName(cleanActivityTitle(activity.title), childName)}</span>
                    <span style={{ fontSize: 16 }}>✅</span>
                  </div>
                )) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeTab === 'profile' ? (
        <div ref={profileScrollRef} style={{ flex: 1, overflowY: 'auto' }}>
          {profileTab === 'settings' ? (
            <div style={{ padding: 20 }}>
              <button onClick={() => setProfileTab('overview')} style={{ background: 'none', border: 'none', fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.rose, cursor: 'pointer', padding: '0 0 20px', fontWeight: 600 }}>{`← ${t.common.back}`}</button>
              <h1 style={{ margin: '0 0 24px', fontFamily: theme.fonts.serif, fontSize: 26, fontWeight: 700, color: theme.colors.charcoal }}>{t.settings.title}</h1>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: theme.colors.darkText }}>{t.settings.yourName}</label>
                <input defaultValue={parentName} style={{ width: '100%', padding: '14px 16px', borderRadius: 18, border: `1.5px solid ${theme.colors.blushMid}`, fontFamily: theme.fonts.sans, fontSize: 16, color: theme.colors.darkText }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: theme.colors.darkText }}>{t.settings.role}</label>
                <select
                  value={settingsParentRole}
                  onChange={(e) => setSettingsParentRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 44px 14px 16px',
                    borderRadius: 18,
                    border: `1.5px solid ${theme.colors.blushMid}`,
                    fontFamily: theme.fonts.sans,
                    fontSize: 16,
                    color: theme.colors.darkText,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236E6E6E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    backgroundSize: '16px',
                  }}
                >
                  {PARENT_ROLES.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {formatParentRole(roleOption, locale)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: theme.colors.darkText }}>{t.settings.language}</label>
                <select
                  value={locale}
                  onChange={(e) => void saveLanguage(e.target.value as Language)}
                  style={{
                    width: '100%',
                    padding: '14px 44px 14px 16px',
                    borderRadius: 18,
                    border: `1.5px solid ${theme.colors.blushMid}`,
                    fontFamily: theme.fonts.sans,
                    fontSize: 16,
                    color: theme.colors.darkText,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236E6E6E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    backgroundSize: '16px',
                  }}
                >
                  <option value='es'>{t.settings.spanish}</option>
                  <option value='en'>{t.settings.english}</option>
                </select>
              </div>

              <div style={{ background: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, border: `1px solid ${theme.colors.divider}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.colors.sageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👨‍👩‍👧</div>
                  <div>
                    <h3 style={{ fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 700, color: theme.colors.charcoal, margin: 0 }}>{locale === 'es' ? 'Invitar cuidadores' : 'Invite caregivers'}</h3>
                    <p style={{ fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.midText, margin: '2px 0 0' }}>{locale === 'es' ? 'Más ojos, más descubrimientos' : 'More eyes, more discoveries'}</p>
                  </div>
                </div>

                <p style={{ fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText, margin: '0 0 14px', lineHeight: 1.5 }}>
                  {locale === 'es'
                    ? `Comparte este enlace con quienes cuidan a ${childName}. Tendrán su propia cuenta conectada al mismo perfil.`
                    : `Share this link with anyone caring for ${childName}. They'll get their own account connected to the same profile.`}
                </p>

                <p style={{ fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: theme.colors.lightText, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {locale === 'es' ? 'Personas con acceso' : 'People with access'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: theme.colors.blush, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 600, color: theme.colors.darkText, margin: 0 }}>{parentName}</p>
                    <p style={{ fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText, margin: 0 }}>{locale === 'es' ? 'Propietario/a' : 'Owner'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: theme.colors.blushLight, fontFamily: theme.fonts.sans, fontSize: 13, color: inviteLinkError ? '#B0493A' : theme.colors.midText, border: `1px solid ${theme.colors.blushMid}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inviteLink || inviteLinkError || (locale === 'es' ? 'Generando enlace…' : 'Generating invite link…')}
                  </div>
                  <button disabled={inviteLinkLoading} onClick={() => void copyInviteLink()} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: copiedInviteLink ? theme.colors.sageBg : theme.colors.charcoal, color: copiedInviteLink ? theme.colors.sage : '#fff', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, cursor: inviteLinkLoading ? 'not-allowed' : 'pointer', opacity: inviteLinkLoading ? 0.7 : 1 }}>
                    {inviteLinkLoading ? (locale === 'es' ? 'Cargando…' : 'Loading…') : copiedInviteLink ? (locale === 'es' ? '✓ Copiado' : '✓ Copied') : (locale === 'es' ? 'Copiar' : 'Copy')}
                  </button>
                </div>
                {inviteLinkError ? (
                  <button type='button' onClick={() => void ensureInviteLink()} style={{ marginTop: 8, border: 'none', background: 'transparent', padding: 0, fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.roseDark, cursor: 'pointer' }}>
                    {locale === 'es' ? 'Reintentar generar enlace' : 'Retry generating link'}
                  </button>
                ) : null}
              </div>

              <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, border: `1px solid ${theme.colors.divider}` }}>
                <h3 style={{ margin: '0 0 6px', fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 600, color: theme.colors.charcoal }}>{locale === 'es' ? 'Sobre Little Wonder' : 'About Little Wonder'}</h3>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText, lineHeight: 1.5 }}>
                  {locale === 'es' ? 'Compañero de curiosidad para madres y padres. Basado en investigación de Harvard, MIT y NAEYC.' : 'A curiosity companion for parents. Built on research from Harvard, MIT, and NAEYC.'}
                </p>
              </div>

              <SoftButton variant='soft' full onClick={() => void handleSignOut()} style={{ color: theme.colors.roseDark }}>{t.settings.signOut}</SoftButton>
              {settingsStatus ? <p style={{ marginTop: 10, fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.sage }}>{settingsStatus}</p> : null}
              {signOutError ? <p style={{ marginTop: 10, fontFamily: theme.fonts.sans, fontSize: 12, color: 'crimson' }}>{signOutError}</p> : null}
            </div>
          ) : (
            <>
              <input
                ref={profilePhotoInputRef}
                type='file'
                accept='image/*'
                onChange={(event) => void uploadProfilePhoto(event)}
                style={{ display: 'none' }}
              />
              <div style={{ background: 'linear-gradient(180deg, #FCE9E3 0%, #F8DDD4 54%, #F2CFC5 100%)', padding: '12px 16px 16px', borderRadius: '0 0 36px 36px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -54, top: 96, width: 156, height: 156, borderRadius: '50%', background: 'rgba(255,255,255,0.27)' }} />
                <div style={{ position: 'absolute', left: -34, bottom: -30, width: 112, height: 112, borderRadius: '50%', background: 'rgba(255,255,255,0.22)' }} />
                <div style={{ position: 'absolute', right: 26, bottom: 36, width: 62, height: 62, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative', zIndex: 1 }}>
                  <span style={{ fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 700, letterSpacing: 0, color: '#4B3B36' }}>9:41</span>
                  <button
                    onClick={() => setProfileTab('settings')}
                    aria-label={locale === 'es' ? 'Abrir configuración' : 'Open settings'}
                    style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid rgba(255,255,255,0.54)', background: 'rgba(255,255,255,0.66)', color: '#5C4A44', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(113,82,72,0.1)', fontFamily: "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" }}
                  >
                    ⚙️
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div
                    onClick={() => openProfilePhotoPicker()}
                    role='button'
                    aria-label={locale === 'es' ? 'Subir foto del niño' : 'Upload child photo'}
                    style={{ width: 96, height: 96, borderRadius: 999, background: 'rgba(255,255,255,0.72)', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 24px rgba(108,77,71,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', position: 'relative', fontSize: 42, cursor: profilePhotoUploading ? 'default' : 'pointer', opacity: profilePhotoUploading ? 0.8 : 1 }}
                  >
                    <div style={{ width: '100%', height: '100%', borderRadius: 999, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {profilePhotoUrl ? <img src={profilePhotoUrl} alt={childName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🧒'}
                    </div>
                    <button
                      type='button'
                      onClick={(event) => {
                        event.stopPropagation();
                        openProfilePhotoPicker();
                      }}
                      aria-label={locale === 'es' ? 'Cambiar foto' : 'Change photo'}
                      style={{ position: 'absolute', right: -8, bottom: -4, width: 30, height: 30, borderRadius: 999, background: '#FFFFFF', border: '1px solid rgba(232,160,144,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, boxShadow: '0 2px 8px rgba(88,65,58,0.16)', zIndex: 2, cursor: profilePhotoUploading ? 'default' : 'pointer' }}
                      disabled={profilePhotoUploading}
                    >
                      📷
                    </button>
                  </div>

                  <h1 style={{ margin: '12px 0 2px', fontFamily: theme.fonts.sans, fontSize: 31, lineHeight: 1.02, fontWeight: 800, color: '#3E302C' }}>{childName}</h1>
                  {profilePhotoUploading ? (
                    <p style={{ margin: '4px 0 2px', fontFamily: theme.fonts.sans, fontSize: 12, color: '#6E5A55' }}>{locale === 'es' ? 'Subiendo foto…' : 'Uploading photo…'}</p>
                  ) : null}
                  {profilePhotoError ? (
                    <p style={{ margin: '4px 0 2px', fontFamily: theme.fonts.sans, fontSize: 12, color: '#B0493A' }}>{profilePhotoError}</p>
                  ) : null}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, color: '#6E5A55', fontWeight: 600 }}>{childAgeLabel}</span>
                    <span style={{ fontSize: 11, color: '#AF5A50', background: 'rgba(255,255,255,0.66)', border: '1px solid rgba(255,255,255,0.8)', padding: '3px 10px', borderRadius: 999, fontFamily: theme.fonts.sans, fontWeight: 700, lineHeight: 1.2 }}>{`${STAGE_CONTENT.stageEmoji} ${STAGE_CONTENT.stage}`}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 16, position: 'relative', zIndex: 1 }}>
                  {[
                    { n: profileMomentsCount || profileTimeline.length, l: locale === 'es' ? 'Momentos' : 'Moments' },
                    { n: profileSchemaStats.length, l: locale === 'es' ? 'Esquemas' : 'Schemas' },
                    { n: profileInterests.length, l: locale === 'es' ? 'Intereses' : 'Interests' },
                  ].map((s) => (
                    <div key={s.l} style={{ aspectRatio: '1 / 1', background: 'rgba(255,255,255,0.66)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.76)', padding: '12px 6px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(93,70,63,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 24, lineHeight: 1, fontWeight: 800, color: '#43322E' }}>{s.n}</p>
                      <p style={{ margin: '4px 0 0', fontFamily: theme.fonts.sans, fontSize: 11, lineHeight: 1.1, color: '#755F59', fontWeight: 700 }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '0 20px', marginTop: 14, borderBottom: '1px solid #EFDFDA' }}>
                {(['overview', 'timeline'] as const).map((tab) => {
                  const isActive = profileTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setProfileTab(tab)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '11px 0 12px',
                        marginBottom: -1,
                        fontFamily: theme.fonts.sans,
                        fontSize: 15,
                        fontWeight: isActive ? 800 : 700,
                        color: isActive ? '#3F322E' : '#B7A09A',
                        borderBottom: isActive ? '3px solid #D47567' : '3px solid transparent',
                        cursor: 'pointer',
                        letterSpacing: -0.1,
                      }}
                    >
                      {tab === 'overview' ? (locale === 'es' ? 'Resumen' : 'Overview') : (locale === 'es' ? 'Línea De Tiempo' : 'Timeline')}
                    </button>
                  );
                })}
              </div>

              <div style={{ padding: 20 }}>
                {profileTab === 'overview' ? (
                  <>
                    <div style={{ position: 'relative', overflow: 'hidden', background: '#EEE8F8', borderRadius: 18, padding: '18px 20px 20px', marginBottom: 16, border: '1px solid #E1D6F1' }}>
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          top: -22,
                          right: -20,
                          width: 102,
                          height: 102,
                          borderRadius: '50%',
                          background: 'rgba(146, 115, 191, 0.18)',
                          pointerEvents: 'none',
                        }}
                      />
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1, color: '#665286', fontWeight: 700, position: 'relative', zIndex: 1 }}>
                        💜 {locale === 'es' ? `En qué está ${childName} ahora` : `What is ${childName} into right now`}
                      </p>
                      <p style={{ margin: '14px 0 0', fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.66, color: '#2F253D', position: 'relative', zIndex: 1 }}>
                        {profileCuriosityQuote || (locale === 'es' ? `${childName} está construyendo su mundo, un momento a la vez.` : `${childName} is building a world, one moment at a time.`)}
                      </p>
                    </div>

                    <div style={{ marginBottom: 32 }}>
                      <SchemaGardenSection
                        locale={locale}
                        childName={childName}
                        schemaStats={schemaGardenSorted}
                        maxCount={schemaGardenMax}
                        emptyMessage={t.profile.noSchemaData}
                      />
                    </div>

                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>💜</span>
                        <h3 style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 700, color: '#2D2B32', lineHeight: 1.2 }}>Lo que le fascina</h3>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                        {profileInterests.length === 0 ? (
                          <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{locale === 'es' ? 'Aún no hay intereses guardados.' : 'No saved interests yet.'}</p>
                        ) : profileInterests.map((interest) => (
                          <span key={interest} style={{ background: '#FFFFFF', borderRadius: 999, padding: '11px 20px', fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 700, color: '#2F2623', border: '1px solid #E9DFDA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>{ensureInterestEmoji(interest)}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        value={newInterestInput}
                        onChange={(event) => {
                          setNewInterestInput(event.target.value);
                          setShowInterestPicker(false);
                          if (interestError) setInterestError('');
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void submitNewInterest();
                          }
                        }}
                        placeholder={locale === 'es' ? 'Ej: dinosaurios, música, trenes' : 'Ex: dinosaurs, music, trains'}
                        disabled={isAddingInterest}
                        style={{
                          flex: '1 1 220px',
                          minWidth: 180,
                          border: '1px solid #EAD1CC',
                          borderRadius: 999,
                          padding: '9px 13px',
                          fontFamily: theme.fonts.sans,
                          fontSize: 13,
                          color: theme.colors.darkText,
                          background: '#fff',
                        }}
                      />
                      <button
                        type='button'
                        onClick={() => {
                          if (normalizeInterestLabel(newInterestInput).length > 0) {
                            void submitNewInterest();
                            return;
                          }
                          setShowInterestPicker((prev) => !prev);
                        }}
                        disabled={isAddingInterest}
                        style={{
                          border: '1px dashed #E1B7AF',
                          background: '#FFF7F5',
                          borderRadius: 50,
                          padding: '8px 12px',
                          fontFamily: theme.fonts.sans,
                          fontSize: 13,
                          color: theme.colors.roseDark,
                          fontWeight: 700,
                          cursor: isAddingInterest ? 'wait' : 'pointer',
                          opacity: isAddingInterest ? 0.6 : 1,
                        }}
                      >
                        + {locale === 'es' ? 'Agregar' : 'Add'}
                      </button>
                      {showInterestPicker ? (
                        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 8, padding: '2px 2px 0' }}>
                          {CHILD_INTEREST_OPTIONS.map((interestOption) => {
                            const alreadyAdded = profileInterests.some((value) => interestComparableKey(value) === interestComparableKey(interestOption));
                            return (
                              <button
                                key={interestOption}
                                type='button'
                                onClick={() => {
                                  if (alreadyAdded || isAddingInterest) return;
                                  void submitNewInterest(interestOption);
                                }}
                                disabled={alreadyAdded || isAddingInterest}
                                style={{
                                  border: `1px solid ${alreadyAdded ? '#E6D9D6' : '#F0C9C1'}`,
                                  background: alreadyAdded ? '#F9F6F5' : '#FFF7F5',
                                  borderRadius: 999,
                                  padding: '7px 12px',
                                  fontFamily: theme.fonts.sans,
                                  fontSize: 12,
                                  color: alreadyAdded ? theme.colors.lightText : theme.colors.roseDark,
                                  cursor: alreadyAdded || isAddingInterest ? 'not-allowed' : 'pointer',
                                  opacity: alreadyAdded ? 0.65 : 1,
                                }}
                              >
                                {interestOption}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {interestError ? <p style={{ margin: 0, width: '100%', fontFamily: theme.fonts.sans, fontSize: 12, color: '#B0493A' }}>{interestError}</p> : null}
                      </div>
                    </div>

                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18, lineHeight: 1 }}>📝</span>
                          <h3 style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 700, color: '#2D2B32', lineHeight: 1.2 }}>
                            {locale === 'es' ? 'Últimos momentos' : 'Latest moments'}
                          </h3>
                        </div>
                        {profileRecentMoments.length > 3 ? (
                          <button
                            type='button'
                            onClick={() => setShowAllRecentMoments((prev) => !prev)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              padding: '2px 0',
                              fontFamily: theme.fonts.sans,
                              fontSize: 13,
                              fontWeight: 800,
                              color: theme.colors.roseDark,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {showAllRecentMoments
                              ? (locale === 'es' ? 'Ver menos →' : 'Show less →')
                              : (locale === 'es' ? 'Ver todos →' : 'View all →')}
                          </button>
                        ) : null}
                      </div>
                      {profileRecentMoments.length === 0 ? (
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{t.profile.noWonders}</p>
                      ) : (showAllRecentMoments ? profileRecentMoments : profileRecentMoments.slice(0, 3)).map((moment) => {
                        const normalizedSchemas = normalizeSchemaList(moment.schemas ?? []);
                        const schemaForChip = normalizedSchemas[0] ?? SPANISH_SCHEMA_FALLBACK;
                        const momentBody = pickRecentMomentBody(moment, locale);
                        return (
                          <div key={moment.id} style={{ background: '#fff', borderRadius: 18, border: '1px solid #E9DFDA', padding: '13px 14px 14px', marginBottom: 9, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: '#A99A96', lineHeight: 1.1 }}>
                                <span style={{ width: 6, height: 6, borderRadius: 999, background: '#E7A89A', display: 'inline-block' }} />
                                {formatRelativeMomentDate(moment.created_at, locale)}
                              </span>
                              <span style={{ fontSize: 10.5, color: '#A35D51', background: '#FFF0ED', padding: '3px 9px', borderRadius: 999, fontFamily: theme.fonts.sans, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>
                                {formatSchemaChipLabel(schemaForChip)}
                              </span>
                            </div>
                            <p style={{ margin: '10px 0 0', fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 800, lineHeight: 1.38, color: '#3E302C' }}>{momentBody}</p>
                          </div>
                        );
                      })}
                    </div>

                    {hasSavedArticles ? (
                      <div ref={profileBookmarksRef} tabIndex={-1} style={{ outline: 'none', marginBottom: 32 }}>
                        <div style={{ margin: '0 0 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                            <button
                              type='button'
                              onClick={() => setShowProfileBookmarks((v) => !v)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                minWidth: 0,
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                <span style={{ fontSize: 18, lineHeight: 1 }}>🔖</span>
                                <h3 style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 700, color: '#2D2B32', lineHeight: 1.2 }}>
                                  {locale === 'es' ? 'Artículos guardados' : 'Saved articles'}
                                </h3>
                                <span style={{ fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 800, color: '#A65E52', background: '#FFE3DD', borderRadius: 999, padding: '5px 12px', lineHeight: 1, minWidth: 30, textAlign: 'center' }}>
                                  {savedArticles.length}
                                </span>
                              </span>
                            </button>
                          </div>

                        </div>

                        <div style={{ marginTop: 2 }}>
                          {(showProfileBookmarks ? savedArticles : savedArticles.slice(0, 2)).map((article) => {
                            const badge = article.type === 'research'
                              ? { label: locale === 'es' ? 'Investigación' : 'Research', bg: '#EFE7FA', color: '#7A5AA3' }
                              : article.type === 'guide'
                                ? { label: locale === 'es' ? 'Guía' : 'Guide', bg: '#E8F4EC', color: '#4F8E65' }
                                : { label: locale === 'es' ? 'Artículo' : 'Article', bg: '#FFF0ED', color: '#C4685B' };
                            const readTime = article.read_time_minutes ?? 6;
                            const domainLabel = article.domain?.trim() || (locale === 'es' ? 'Crianza' : 'Parenting');

                            return (
                              <button
                                key={`profile-saved-${article.id}`}
                                onClick={() => { setOpenArticleOriginTab('profile'); setOpenExploreArticle(article); }}
                                style={{
                                  width: '100%',
                                  background: '#fff',
                                  borderRadius: 16,
                                  padding: '11px 12px',
                                  marginBottom: 9,
                                  border: '1px solid #ECE2DD',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 11,
                                }}
                              >
                                <span style={{ width: 32, height: 32, borderRadius: 999, background: '#FFF4F0', border: '1px solid #F3DED7', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, lineHeight: 1 }}>
                                  {article.emoji || '📚'}
                                </span>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 800, color: '#493A35', lineHeight: 1.28 }}>
                                    {article.title}
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, minWidth: 0, flexWrap: 'wrap' }}>
                                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 10.5, fontWeight: 800, color: badge.color, background: badge.bg, padding: '3px 8px', borderRadius: 999, lineHeight: 1 }}>
                                      {badge.label}
                                    </span>
                                    {article.is_read ? <span style={{ fontFamily: theme.fonts.sans, fontSize: 10.5, fontWeight: 700, color: '#2E7D32', background: '#EAF7ED', padding: '3px 8px', borderRadius: 999, lineHeight: 1 }}>{t.learn.read}</span> : null}
                                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 11.5, color: '#958782', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 118 }}>
                                      {domainLabel}
                                    </span>
                                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 11.5, color: '#958782', whiteSpace: 'nowrap' }}>
                                      · ☕ {readTime} min
                                    </span>
                                  </span>
                                </span>
                                <span style={{ flexShrink: 0, fontSize: 18, color: '#B39A93' }}>›</span>
                              </button>
                            );
                          })}

                          {!showProfileBookmarks ? (
                            <button
                              type='button'
                              onClick={() => {
                                if (savedArticles.length > 2) {
                                  setShowProfileBookmarks(true);
                                  return;
                                }
                                openSavedArticlesView('profile');
                              }}
                              style={{ width: '100%', marginTop: 8, background: '#F8E8E0', border: 'none', borderRadius: 12, padding: '11px', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 800, color: '#D4766A', cursor: 'pointer' }}
                            >
                              {savedArticles.length > 2
                                ? (locale === 'es' ? `Ver ${savedArticles.length - 2} más →` : `View ${savedArticles.length - 2} more →`)
                                : (locale === 'es' ? `Ver todos (${savedArticles.length}) →` : `View all (${savedArticles.length}) →`)}
                            </button>
                          ) : null}

                          {showProfileBookmarks ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                              <button
                                type='button'
                                onClick={() => setShowProfileBookmarks(false)}
                                style={{ border: 'none', background: 'transparent', padding: '8px 2px', fontFamily: theme.fonts.sans, fontSize: 12, color: '#8A8690', cursor: 'pointer', fontWeight: 700 }}
                              >
                                {locale === 'es' ? 'Mostrar menos' : 'Show less'}
                              </button>
                              <button
                                type='button'
                                onClick={() => openSavedArticlesView('profile')}
                                style={{ border: 'none', background: 'transparent', padding: '8px 2px', fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.roseDark, cursor: 'pointer', fontWeight: 800 }}
                              >
                                {locale === 'es' ? `Ver todos (${savedArticles.length}) →` : `View all (${savedArticles.length}) →`}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {completedActivities.length > 0 ? (
                      <div style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18, lineHeight: 1 }}>✅</span>
                            <h3 style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 700, color: '#2D2B32', lineHeight: 1.2 }}>
                              {locale === 'es' ? 'Actividades realizadas' : 'Completed activities'}
                            </h3>
                            <span style={{ fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 800, color: '#4F8E65', background: '#EAF7ED', borderRadius: 999, padding: '5px 12px', lineHeight: 1, minWidth: 30, textAlign: 'center' }}>
                              {completedActivities.length}
                            </span>
                          </div>
                          {completedActivities.length > 2 ? (
                            <button
                              type='button'
                              onClick={() => setShowProfileCompletedActivities((prev) => !prev)}
                              style={{ border: 'none', background: 'transparent', padding: '2px 0', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 800, color: theme.colors.roseDark, cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              {showProfileCompletedActivities
                                ? (locale === 'es' ? 'Ver menos →' : 'Show less →')
                                : (locale === 'es' ? 'Ver todos →' : 'View all →')}
                            </button>
                          ) : null}
                        </div>

                        {(showProfileCompletedActivities ? completedActivities : completedActivities.slice(0, 2)).map((activity) => (
                          <div key={`profile-completed-${activity.id}`} style={{ background: '#fff', borderRadius: 16, padding: '11px 12px', marginBottom: 9, border: '1px solid #ECE2DD', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, opacity: 0.9 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                              <span style={{ width: 30, height: 30, borderRadius: 999, background: '#EAF7ED', border: '1px solid #D8EEDC', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                                {activity.emoji || '✅'}
                              </span>
                              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 800, color: '#493A35', lineHeight: 1.28, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {withChildName(cleanActivityTitle(activity.title), childName)}
                                </span>
                                <span style={{ fontFamily: theme.fonts.sans, fontSize: 11.5, color: '#958782' }}>
                                  {activity.completed_at ? `${locale === 'es' ? 'Completada' : 'Completed'} · ${formatRelativeMomentDate(activity.completed_at, locale)}` : (locale === 'es' ? 'Completada' : 'Completed')}
                                </span>
                              </span>
                            </span>
                            <span style={{ flexShrink: 0, fontSize: 16 }}>✅</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null}

                {profileTab === 'timeline' ? (
                  <>
                    {profileTimeline.length === 0 ? (
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{t.profile.noWonders}</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {profileTimeline.map((entry, i) => {
                          const schemaKey = normalizeSchemaKey(entry.schemas[0]);
                          const schemaInfo = schemaKey ? SCHEMA_INFO[schemaKey] : null;
                          const railColor = schemaInfo?.color ?? '#D3C5C1';
                          const chipLabel = schemaInfo ? `${schemaInfo.emoji} ${schemaInfo.label}` : (locale === 'es' ? '✨ Momento' : '✨ Moment');
                          const bodyText = localizeKnownTimelinePrompt(entry.observation?.trim() || entry.title?.trim() || '', locale, childName);

                          return (
                            <div key={entry.id} style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
                              <div style={{ position: 'relative', width: 22, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                {i < profileTimeline.length - 1 ? (
                                  <span
                                    aria-hidden
                                    style={{
                                      position: 'absolute',
                                      top: 18,
                                      bottom: -14,
                                      width: 1.5,
                                      borderRadius: 999,
                                      background: 'rgba(194,174,168,0.48)',
                                    }}
                                  />
                                ) : null}
                                <span
                                  aria-hidden
                                  style={{
                                    marginTop: 7,
                                    width: 11,
                                    height: 11,
                                    borderRadius: 999,
                                    background: railColor,
                                    border: '2px solid #FFF7F3',
                                    boxShadow: '0 0 0 1px rgba(210,194,188,0.55)',
                                    zIndex: 1,
                                  }}
                                />
                              </div>

                              <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, border: '1px solid #E9DFDB', padding: '12px 14px 13px', minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                  <span style={{ fontFamily: theme.fonts.sans, fontSize: 11.5, fontWeight: 700, color: '#9B8D88' }}>
                                    {formatRelativeMomentDate(entry.created_at, locale)}
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: theme.fonts.sans,
                                      fontSize: 10.5,
                                      fontWeight: 800,
                                      color: schemaInfo?.color ?? '#8E7C77',
                                      background: schemaInfo?.bg ?? '#F7F0EE',
                                      borderRadius: 999,
                                      padding: '4px 9px',
                                      lineHeight: 1,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {chipLabel}
                                  </span>
                                </div>
                                <p style={{ margin: '9px 0 0', fontFamily: "'Nunito', sans-serif", fontSize: 16, lineHeight: 1.4, fontWeight: 800, color: '#3E302C' }}>
                                  {bodyText}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        <p style={{ margin: '28px 4px 2px', fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16, lineHeight: 1.6, color: 'rgba(89,69,65,0.7)' }}>
                          {locale === 'es' ? `${childName} sigue tejiendo su historia, momento a momento ✨` : `${childName} keeps weaving their story, one moment at a time ✨`}
                        </p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : null}

      {activitiesToast ? (
        <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 108, zIndex: 120, background: 'rgba(46,43,50,0.94)', color: '#fff', padding: '10px 14px', borderRadius: 12, fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, boxShadow: '0 6px 18px rgba(0,0,0,0.2)' }}>
          {activitiesToast}
        </div>
      ) : null}

      <p style={{ margin: '10px 0 94px', textAlign: 'center', fontFamily: theme.fonts.sans, fontSize: 11, color: 'rgba(123,115,113,0.78)' }}>
        {locale === 'es' ? 'Hecho para acompañar tu mirada curiosa.' : 'Made to support your curious parenting eye.'}
      </p>
      <nav style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 0, width: '100%', maxWidth: 390, zIndex: 90, background: 'rgba(255,251,247,0.96)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${theme.colors.divider}`, display: 'flex', justifyContent: 'space-around', padding: '10px 0 calc(16px + env(safe-area-inset-bottom))' }}>
        {[
          { id: 'chat' as Tab, icon: '💬', label: t.tabs.chat },
          { id: 'explore' as Tab, icon: '🔭', label: t.tabs.learn },
          { id: 'activities' as Tab, icon: '🎯', label: t.tabs.activities },
          { id: 'profile' as Tab, icon: '🧒', label: childName },
        ].map((tab) => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ textAlign: 'center', cursor: 'pointer', opacity: activeTab === tab.id ? 1 : 0.35 }}>
            <span style={{ fontSize: 20, display: 'block' }}>{tab.icon}</span>
            <span style={{ fontFamily: theme.fonts.sans, fontSize: 10, letterSpacing: 0.2, color: activeTab === tab.id ? theme.colors.roseDark : theme.colors.midText, fontWeight: activeTab === tab.id ? 700 : 400 }}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </main>
  );
}
