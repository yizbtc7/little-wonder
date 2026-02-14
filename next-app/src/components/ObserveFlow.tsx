'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FadeUp from '@/components/ui/FadeUp';
import SoftButton from '@/components/ui/SoftButton';
import { DAILY_INSIGHT } from '@/data/daily-insights';
import { STAGE_CONTENT } from '@/data/stage-content';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { theme } from '@/styles/theme';
import { replaceChildName } from '@/utils/personalize';
import { translations, type Language } from '@/lib/translations';
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

type ExploreBrainCardRow = {
  id: string;
  language?: 'en' | 'es';
  icon: string;
  title: string;
  domain: string;
  preview: string;
  article: {
    whats_happening: string;
    fascinating_part: string;
    youll_see_it_when: string[];
    how_to_be_present: string;
  };
};

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
    current_streak: number;
    moments_count: number;
  };
  interests?: string[];
  schema_stats?: ProfileSchemaStat[];
  top_schema?: ProfileSchemaStat | null;
  timeline?: ProfileWonderTimelineEntry[];
  recent_moments?: Array<{ id: string; title: string; observation: string; created_at: string }>;
};

type Props = {
  parentName: string;
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
  return {
    reply: replyText.length > 0 ? replyText : fallback.reply,
    wonder: parsedPayload.wonder ?? null,
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

function formatSchemaLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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

const schemaBadgeColors: Record<string, string> = {
  trajectory: '#E8A090',
  rotation: '#C4B5D4',
  enclosure: '#8FAE8B',
  enveloping: '#E8C890',
  transporting: '#90B8E8',
  connecting: '#E89090',
  transforming: '#B890E8',
  positioning: '#90D4C4',
};

function schemaContextLine(schema: string, childName: string): string | null {
  const map: Record<string, string> = {
    trajectory: `Because ${childName} loves throwing and dropping things`,
    transporting: `Because ${childName} carries everything everywhere`,
    rotation: `Because ${childName} is fascinated by things that spin`,
    enclosure: `Because ${childName} loves putting things inside other things`,
    connecting: `Because ${childName} wants to connect and disconnect everything`,
    transforming: `Because ${childName} loves mixing and changing things`,
    positioning: `Because ${childName} lines everything up just right`,
    enveloping: `Because ${childName} loves hiding and wrapping things`,
  };

  return map[schema] ?? null;
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
  return (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
}

function dedupeArticleTitleKey(title: string): string {
  return title
    .replace(/\s*·\s*(?:ACT)?B\d+-[\w-]+$/i, '')
    .replace(/\s*\((?:ACT)?B\d+-[\w-]+\)$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
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

export default function ObserveFlow({ parentName, childName, childAgeLabel, childBirthdate, childId, initialLanguage = 'es' }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState(0);
  const [selectedExploreCard, setSelectedExploreCard] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<'brain' | 'activity' | null>(null);
  const [signOutError, setSignOutError] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
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
  const [openExploreArticle, setOpenExploreArticle] = useState<ExploreArticleRow | null>(null);
  const [exploreStats, setExploreStats] = useState({ total_available: 0, total_read: 0, reading_streak_days: 0 });
  const [showReadArticles, setShowReadArticles] = useState(false);
  const [showProfileBookmarks, setShowProfileBookmarks] = useState(true);
  const [articleReadPulse, setArticleReadPulse] = useState(false);
  const [readerToast, setReaderToast] = useState('');
  const [pendingProfileBookmarksFocus, setPendingProfileBookmarksFocus] = useState(false);
  const [focusChatComposerIntent, setFocusChatComposerIntent] = useState(false);
  const [openActivityDetail, setOpenActivityDetail] = useState<ActivityItem | null>(null);
  const [activitiesFeatured, setActivitiesFeatured] = useState<ActivityItem | null>(null);
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);
  const [savedActivities, setSavedActivities] = useState<ActivityItem[]>([]);
  const [completedActivities, setCompletedActivities] = useState<ActivityItem[]>([]);
  const [activitiesStats, setActivitiesStats] = useState({ total: 0, completed: 0 });
  const [showCompletedActivities, setShowCompletedActivities] = useState(false);
  const [childSchemas, setChildSchemas] = useState<string[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [activitiesRetry, setActivitiesRetry] = useState(0);
  const [profileTimeline, setProfileTimeline] = useState<ProfileWonderTimelineEntry[]>([]);
  const [profileSchemaStats, setProfileSchemaStats] = useState<ProfileSchemaStat[]>([]);
  const [profileInterests, setProfileInterests] = useState<string[]>([]);
  const [profileRecentMoments, setProfileRecentMoments] = useState<Array<{ id: string; title: string; observation: string; created_at: string }>>([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profileCuriosityQuote, setProfileCuriosityQuote] = useState<string>('');
  const [profileStreak, setProfileStreak] = useState(0);
  const [profileMomentsCount, setProfileMomentsCount] = useState(0);
  const [profileTopSchema, setProfileTopSchema] = useState<ProfileSchemaStat | null>(null);
  const [locale, setLocale] = useState<Language>(initialLanguage);
  const t = translations[locale];

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const profileBookmarksRef = useRef<HTMLDivElement>(null);
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
    const sourceCards = exploreCards.map((card) => ({
      icon: card.icon,
      title: card.title,
      domain: card.domain,
      color: theme.colors.lavenderBg,
      preview: card.preview,
      full: {
        whats_happening: card.article.whats_happening,
        youll_see_it_when: card.article.youll_see_it_when,
        fascinating_part: card.article.fascinating_part,
        how_to_be_present: card.article.how_to_be_present,
      },
    }));

    return sourceCards.map((card) => ({
      ...card,
      title: withChildName(card.title, childName),
      preview: withChildName(card.preview, childName),
      full: {
        whats_happening: withChildName(card.full.whats_happening, childName),
        youll_see_it_when: card.full.youll_see_it_when.map((v) => withChildName(v, childName)),
        fascinating_part: withChildName(card.full.fascinating_part, childName),
        how_to_be_present: withChildName(card.full.how_to_be_present, childName),
      },
    }));
  }, [childName, exploreCards, locale]);

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

  useEffect(() => {
    if (activeTab !== 'explore') return;
    setOpenExploreArticle(null);
    void (async () => {
      try {
        const [exploreResponse, articlesResponse] = await Promise.all([
          fetch(apiUrl('/api/explore')),
          fetch(apiUrl(`/api/explore/articles?language=${locale}`)),
        ]);

        if (exploreResponse.ok) {
          const payload = (await exploreResponse.json()) as {
            brain_cards?: ExploreBrainCardRow[];
            daily_tip?: ExploreDailyTipRow | null;
          };
          setExploreCards(payload.brain_cards ?? []);
          setExploreDailyTip(payload.daily_tip ?? null);
        }

        if (articlesResponse.ok) {
          const payload = (await articlesResponse.json()) as {
            new_for_you?: ExploreArticleRow[];
            keep_reading?: ExploreArticleRow[];
            deep_dives?: ExploreArticleRow[];
            recently_read?: ExploreArticleRow[];
            coming_next?: ExploreArticleRow[];
            stats?: { total_available?: number; total_read?: number; reading_streak_days?: number };
          };
          setNewForYouArticles(payload.new_for_you ?? []);
          setKeepReadingArticles(payload.keep_reading ?? []);
          setDeepDiveArticles(payload.deep_dives ?? []);
          setRecentlyReadArticles(payload.recently_read ?? []);
          setComingNextArticles(payload.coming_next ?? []);
          setExploreStats({
            total_available: payload.stats?.total_available ?? 0,
            total_read: payload.stats?.total_read ?? 0,
            reading_streak_days: payload.stats?.reading_streak_days ?? 0,
          });
        }
      } catch {
        // ignore fetch errors in non-browser test environments
      }
    })();
  }, [activeTab, locale]);

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

  const openAllSavedInProfile = () => {
    setActiveTab('profile');
    setShowProfileBookmarks(true);
    setPendingProfileBookmarksFocus(true);
  };

  useEffect(() => {
    if (activeTab !== 'profile' || !pendingProfileBookmarksFocus) return;
    profileBookmarksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    profileBookmarksRef.current?.focus();
    setPendingProfileBookmarksFocus(false);
  }, [activeTab, pendingProfileBookmarksFocus]);

  useEffect(() => {
    if (!openExploreArticle) return;

    const articleId = openExploreArticle.id;
    const openedAtMs = Date.now();
    let completed = false;

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
      setArticleReadPulse(true);
      setTimeout(() => setArticleReadPulse(false), 1400);
      setNewForYouArticles((prev) => prev.filter((a) => a.id !== articleId));
      const article = openExploreArticle;
      setRecentlyReadArticles((prev) => [{ ...article, is_read: true, completed_at: new Date().toISOString() }, ...prev.filter((a) => a.id !== articleId)].slice(0, 10));
      setExploreStats((prev) => ({ ...prev, total_read: Math.min(prev.total_available, prev.total_read + 1) }));
    };

    const timer = setTimeout(() => {
      void maybeComplete();
    }, 60000);

    const onScroll = () => {
      if (!openExploreArticle) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const ratio = window.scrollY / maxScroll;
      if (ratio >= 0.9) {
        void maybeComplete();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
      const elapsed = Math.max(1, Math.round((Date.now() - openedAtMs) / 1000));
      void fetch(apiUrl(`/api/explore/articles/${articleId}/read`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_completed: completed, read_time_seconds: elapsed }),
      });
    };
  }, [openExploreArticle]);

  useEffect(() => {
    setActivitiesLoaded(false);
  }, [locale, childId]);

  useEffect(() => {
    if (activeTab !== 'activities' || activitiesLoaded) return;
    void (async () => {
      try {
        const response = await fetch(apiUrl(`/api/activities?child_id=${childId}`));
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
        setProfileRecentMoments(payload.recent_moments ?? []);
        setProfilePhotoUrl(payload.child?.photo_url ?? null);
        setProfileCuriosityQuote(payload.child?.curiosity_quote ?? '');
        setProfileStreak(payload.child?.current_streak ?? 0);
        setProfileMomentsCount(payload.child?.moments_count ?? 0);
        setProfileTopSchema(payload.top_schema ?? null);
      } catch {
        // ignore fetch errors in non-browser test environments
      }
    })();
  }, [activeTab, childId]);

  const toggleSaveActivity = async (activityId: string, isSaved: boolean) => {
    await fetch(apiUrl(`/api/activities/${activityId}/save`), { method: isSaved ? 'DELETE' : 'POST' });
    setActivitiesLoaded(false);
    setActivitiesRetry((v) => v + 1);
  };

  const completeActivity = async (activityId: string) => {
    await fetch(apiUrl(`/api/activities/${activityId}/complete`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setOpenActivityDetail(null);
    setActivitiesLoaded(false);
    setActivitiesRetry((v) => v + 1);
  };

  const copyInviteLink = async () => {
    const inviteUrl = `https://www.littlewonder.ai/join/${childId.slice(0, 8)}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInviteLink(true);
      setTimeout(() => setCopiedInviteLink(false), 1800);
    } catch {
      setCopiedInviteLink(false);
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

  if (activeTab === 'explore' && openExploreArticle) {
    return (
      <ArticleReader
        article={openExploreArticle}
        childName={childName}
        childAgeLabel={childAgeLabel}
        locale={locale}
        isBookmarked={Boolean(openExploreArticle.is_bookmarked)}
        toastMessage={readerToast}
        onToggleBookmark={() => void toggleArticleBookmark(openExploreArticle.id)}
        onShare={() => void shareArticle(openExploreArticle)}
        onBack={() => setOpenExploreArticle(null)}
        onRegisterMoment={() => {
          setOpenExploreArticle(null);
          setActiveTab('chat');
          setFocusChatComposerIntent(true);
        }}
      />
    );
  }

  if (activeTab === 'explore' && selectedExploreCard !== null) {
    const card = personalizedCards[selectedExploreCard];
    const hasDistinctFascinating =
      card.full.fascinating_part.trim().length > 0 && card.full.fascinating_part.trim() !== card.full.whats_happening.trim();
    const distinctSigns = card.full.youll_see_it_when.filter((item) => item.trim().length > 0 && item.trim() !== card.full.whats_happening.trim());
    const hasPresenceText = card.full.how_to_be_present.trim().length > 0;

    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream }}>
        <div
          style={{
            background: `linear-gradient(180deg, ${card.color ?? theme.colors.blush} 0%, ${theme.colors.cream} 100%)`,
            padding: '16px 24px 40px',
          }}
        >
          <button
            onClick={() => setSelectedExploreCard(null)}
            style={{
              background: 'rgba(255,255,255,0.5)',
              border: 'none',
              borderRadius: 50,
              padding: '8px 16px',
              fontFamily: theme.fonts.sans,
              fontSize: 13,
              fontWeight: 600,
              color: theme.colors.darkText,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 14 }}>←</span> Back
          </button>

          <FadeUp delay={100}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 64,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                {card.icon}
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: theme.colors.roseDark,
                  background: 'rgba(255,255,255,0.6)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontFamily: theme.fonts.sans,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {card.domain}
              </span>
            </div>
            <h1
              style={{
                fontFamily: theme.fonts.serif,
                fontSize: 30,
                color: theme.colors.charcoal,
                margin: 0,
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: -0.3,
              }}
            >
              {card.title}
            </h1>
          </FadeUp>
        </div>

        <div style={{ padding: '0 24px 120px', marginTop: -8 }}>
          <FadeUp delay={300}>
            <p
              style={{
                fontFamily: theme.fonts.sans,
                fontSize: 16.5,
                color: theme.colors.darkText,
                margin: '0 0 28px',
                lineHeight: 1.75,
                fontWeight: 400,
              }}
            >
              {card.full.whats_happening}
            </p>
          </FadeUp>

          {hasDistinctFascinating ? (
            <FadeUp delay={500}>
              <div
                style={{
                  margin: '0 0 32px',
                  padding: '24px 0',
                  borderTop: `2px solid ${theme.colors.rose}30`,
                  borderBottom: `2px solid ${theme.colors.rose}30`,
                }}
              >
                <p
                  style={{
                    fontFamily: theme.fonts.serif,
                    fontSize: 19,
                    color: theme.colors.charcoal,
                    margin: 0,
                    lineHeight: 1.5,
                    fontWeight: 600,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '0 8px',
                  }}
                >
                  {card.full.fascinating_part}
                </p>
              </div>
            </FadeUp>
          ) : null}

          {distinctSigns.length > 0 ? (
            <FadeUp delay={700}>
              <p
                style={{
                  fontFamily: theme.fonts.sans,
                  fontSize: 12,
                  fontWeight: 700,
                  color: theme.colors.rose,
                  margin: '0 0 14px',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                ✨ You&apos;ll recognize it when…
              </p>
              <div style={{ marginBottom: 32 }}>
                {distinctSigns.map((item, i) => (
                  <div key={item} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: theme.colors.blush,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <span style={{ fontSize: 13, color: theme.colors.roseDark, fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <p style={{ fontFamily: theme.fonts.sans, fontSize: 15, color: theme.colors.darkText, margin: 0, lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          ) : null}

          {hasDistinctFascinating || distinctSigns.length > 0 ? (
            <FadeUp delay={850}>
              <div
                style={{
                  width: 40,
                  height: 3,
                  borderRadius: 2,
                  background: theme.colors.blushMid,
                  margin: '0 auto 32px',
                }}
              />
            </FadeUp>
          ) : null}

          {hasPresenceText ? (
            <FadeUp delay={900}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.blush}90 0%, ${theme.colors.warmWhite} 100%)`,
                  borderRadius: 32,
                  padding: '28px 24px',
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    fontFamily: theme.fonts.sans,
                    fontSize: 12,
                    fontWeight: 700,
                    color: theme.colors.sage,
                    margin: '0 0 10px',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  🤲 How to be present
                </p>
                <p style={{ fontFamily: theme.fonts.sans, fontSize: 16, color: theme.colors.darkText, margin: 0, lineHeight: 1.7 }}>
                  {card.full.how_to_be_present}
                </p>
              </div>
            </FadeUp>
          ) : null}

          <FadeUp delay={1050}>
            <p
              style={{
                fontFamily: theme.fonts.sans,
                fontSize: 12,
                color: theme.colors.lightText,
                textAlign: 'center',
                margin: '24px 0 0',
                lineHeight: 1.5,
              }}
            >
              Based on developmental research from Gopnik, Athey &amp; Harvard CCHD
            </p>
          </FadeUp>
        </div>
      </main>
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
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
          <div style={{ padding: '20px 24px 0' }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 28, fontWeight: 700, color: '#2D2B32' }}>{t.learn.title}</h1>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, color: '#8A8690' }}>{t.learn.subtitle(childName)}</p>
            <div style={{ marginTop: 16, height: 1, background: '#F0EDE8' }} />
          </div>
          <div style={{ padding: '12px 16px 0' }}>
            {exploreStats.total_available === 0 && personalizedCards.length === 0 && !exploreDailyTip ? (
              <div style={{ textAlign: 'center', padding: '40px 24px', background: `linear-gradient(135deg, ${theme.colors.blushLight} 0%, ${theme.colors.cream} 100%)`, borderRadius: 20, border: `1px dashed ${theme.colors.divider}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
                <p style={{ margin: '0 0 4px', fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 600, color: theme.colors.charcoal }}>Contenido en camino</p>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText, lineHeight: 1.5 }}>Estamos preparando artículos fascinantes sobre el desarrollo de {childName} a esta edad. ¡Vuelve pronto!</p>
              </div>
            ) : null}
            {!(exploreStats.total_available === 0 && personalizedCards.length === 0 && !exploreDailyTip) ? (
            <>
            {exploreStats.total_available > 0 ? (
              <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>📚</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#F0EDE8' }}>
                  <div style={{ width: `${exploreStats.total_available > 0 ? Math.round((exploreStats.total_read / exploreStats.total_available) * 100) : 0}%`, height: 6, borderRadius: 3, background: '#E8A090' }} />
                </div>
                <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, color: '#8A8690' }}>{exploreStats.total_read} de {exploreStats.total_available} leídos</span>
              </div>
            ) : null}

            {savedArticles.length > 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0EDE8', padding: '14px 14px 8px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: '#2D2B32' }}>🔖 {locale === 'es' ? 'Guardados' : 'Saved'}</p>
                  <button onClick={openAllSavedInProfile} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: '#D4766A' }}>
                    {locale === 'es' ? `Ver todos (${savedArticles.length}) →` : `View all (${savedArticles.length}) →`}
                  </button>
                </div>
                {savedArticles.slice(0, 3).map((article) => (
                  <button key={`saved-preview-${article.id}`} onClick={() => setOpenExploreArticle(article)} style={{ width: '100%', background: '#fff', borderRadius: 12, padding: '9px 10px', marginBottom: 8, border: '1px solid #F0EDE8', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: '#2D2B32', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</span>
                    <span style={{ marginLeft: 8, fontSize: 14 }}>🔖</span>
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
            {personalizedCards.slice(0, 3).map((card, idx) => {
              const d = card.domain?.toLowerCase() ?? '';
              const bg = d.includes('cogn') ? '#EDE5F5' : d.includes('motiv') ? '#FFF0ED' : d.includes('social') ? '#E8F5EE' : d.includes('leng') ? '#FFF0ED' : d.includes('motor') ? '#E5F0F8' : d.includes('emoc') ? '#FFF8E0' : '#F5F0EB';
              const badgeColor = d.includes('cogn') ? '#8B6CAE' : d.includes('motiv') ? '#D4766A' : d.includes('social') ? '#5A9E6F' : d.includes('leng') ? '#D4766A' : d.includes('motor') ? '#5A8AA0' : '#8A8690';
              return (
                <button key={card.title} onClick={() => setSelectedExploreCard(idx)} style={{ width: '100%', background: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 12, border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', gap: 14, textAlign: 'left', cursor: 'pointer' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: bg, flexShrink: 0 }}>{card.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 700, color: '#2D2B32' }}>{card.title}</p>
                      <span style={{ fontSize: 11, fontFamily: theme.fonts.sans, fontWeight: 600, color: badgeColor, background: bg, padding: '3px 10px', borderRadius: 20 }}>{card.domain}</span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontFamily: theme.fonts.sans, fontSize: 13, lineHeight: 1.5, color: '#8A8690', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{withChildName(card.preview, childName)}</p>
                    <p style={{ margin: '6px 0 0', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, color: '#E8A090' }}>{locale === 'es' ? 'Leer más →' : 'Read more →'}</p>
                  </div>
                </button>
              );
            })}

            <h2 style={{ margin: '28px 4px 14px', fontFamily: theme.fonts.sans, fontSize: 18, fontWeight: 700, color: '#2D2B32' }}>🆕 {t.learn.newForYou}</h2>
            {newForYouArticles.length === 0 ? (
              <div style={{ background: theme.colors.blushLight, borderRadius: 18, padding: '16px 14px', textAlign: 'center', marginBottom: 14 }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.midText }}>{t.learn.allCaughtUp(childName)}</p>
                {comingNextArticles.length > 0 ? (
                  <p style={{ margin: '8px 0 0', fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText }}>{t.learn.upcomingLocked}</p>
                ) : null}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingLeft: 4, paddingBottom: 6, marginRight: -20, paddingRight: 20, marginBottom: 12, scrollbarWidth: 'none' as const, msOverflowStyle: 'none' as const }}>
                {newForYouArticles.slice(0, 3).map((article) => (
                  <button key={article.id} onClick={() => setOpenExploreArticle(article)} style={{ width: 220, flexShrink: 0, background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EDE8', textAlign: 'left', cursor: 'pointer', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ height: 6, background: article.type === 'guide' ? '#8FAE8B' : article.type === 'research' ? '#C4B5D4' : '#E8A090' }} />
                    <div style={{ padding: '16px 16px 0', fontSize: 11, fontWeight: 600, fontFamily: theme.fonts.sans, textTransform: 'uppercase', color: article.type === 'guide' ? '#5A9E6F' : article.type === 'research' ? '#8B6CAE' : '#D4766A' }}>{formatExploreTypeLabel(article.type, locale)}</div>
                    <p style={{ margin: '6px 16px 0', fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 700, color: '#2D2B32', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</p>
                    <p style={{ margin: '10px 16px 16px', fontFamily: theme.fonts.sans, fontSize: 12, color: '#8A8690' }}>📖 {article.read_time_minutes ?? 7} min</p>
                  </button>
                ))}
              </div>
            )}


            {deepDiveArticles.length > 0 ? (
              <>
                <h2 style={{ margin: '16px 4px 2px', fontFamily: theme.fonts.sans, fontSize: 18, fontWeight: 700, color: '#2D2B32' }}>🔬 {t.learn.deepDives}</h2>
                <p style={{ margin: '0 4px 10px', fontFamily: theme.fonts.sans, fontSize: 12, color: '#8A8690' }}>{locale === 'es' ? 'La ciencia detrás del desarrollo' : 'The science behind development'}</p>
                {deepDiveArticles
                  .filter((article, index, all) => all.findIndex((candidate) => dedupeArticleTitleKey(candidate.title) === dedupeArticleTitleKey(article.title)) === index)
                  .slice(0, 3)
                  .map((article) => (
                  <button key={`deep-${article.id}`} onClick={() => setOpenExploreArticle(article)} style={{ width: '100%', background: '#fff', borderRadius: 16, padding: '12px 14px', marginBottom: 8, border: '1px solid #F0EDE8', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#EDE5F5' }}>{article.emoji}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: '#2D2B32', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: '#8B6CAE', background: '#EDE5F5', padding: '3px 10px', borderRadius: 20 }}>{locale === 'es' ? 'INVESTIGACIÓN' : 'RESEARCH'}</span>
                        <span style={{ fontFamily: theme.fonts.sans, fontSize: 11, color: '#8A8690' }}>{article.read_time_minutes ?? 6} min</span>
                      </span>
                    </span>
                    <span style={{ color: '#B0ADB5' }}>›</span>
                  </button>
                ))}
              </>
            ) : null}

            {(keepReadingArticles.length > 0 || comingNextArticles.length > 0) ? (
              <>
                <h2 style={{ margin: '16px 4px 10px', fontFamily: theme.fonts.sans, fontSize: 18, fontWeight: 700, color: '#2D2B32' }}>📚 {locale === 'es' ? 'Más artículos para esta edad' : 'More articles for this age'}</h2>
                {[...keepReadingArticles, ...comingNextArticles]
                  .filter((article, index, all) => all.findIndex((candidate) => dedupeArticleTitleKey(candidate.title) === dedupeArticleTitleKey(article.title)) === index)
                  .slice(0, 8)
                  .map((article) => (
                  <button key={`more-${article.id}`} onClick={() => setOpenExploreArticle(article)} style={{ width: '100%', background: '#fff', borderRadius: 14, padding: '10px 12px', marginBottom: 8, border: '1px solid #F0EDE8', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: '#2D2B32', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</span>
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
                  <button key={article.id} onClick={() => setOpenExploreArticle(article)} style={{ width: '100%', background: '#fff', opacity: 0.85, borderRadius: 16, padding: '10px 12px', marginBottom: 8, border: `1px solid ${theme.colors.divider}`, textAlign: 'left', cursor: 'pointer' }}>
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: theme.colors.darkText }}>{article.title}</span>
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
            <h1 style={{ fontFamily: theme.fonts.serif, fontSize: 28, color: theme.colors.charcoal, margin: '0 0 8px', fontWeight: 700, lineHeight: 1.15, textAlign: 'center' }}>{withChildName(openActivityDetail.title, childName)}</h1>
            <p style={{ fontFamily: theme.fonts.sans, fontSize: 16, color: theme.colors.midText, margin: 0, textAlign: 'center' }}>{withChildName(openActivityDetail.subtitle, childName)}</p>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: theme.colors.midText, background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 600 }}>⏱ {openActivityDetail.duration_minutes} min</span>
              <span style={{ fontSize: 11, color: '#fff', background: schemaBadgeColors[openActivityDetail.schema_target] ?? theme.colors.rose, padding: '4px 12px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{formatSchemaLabel(openActivityDetail.schema_target)}</span>
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
            <button onClick={() => void completeActivity(openActivityDetail.id)} style={{ border: 'none', borderRadius: 14, padding: '12px 16px', background: theme.colors.sage, color: '#fff', fontFamily: theme.fonts.sans, fontWeight: 700, cursor: 'pointer' }}>
              ✅ {locale === 'es' ? '¡Lo hicimos!' : 'We did it!'}
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
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: '#fff', border: `1px solid ${theme.colors.divider}` }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div style={{ flex: 1, height: 6, background: theme.colors.divider, borderRadius: 10 }}>
                  <div style={{ width: `${Math.round((activitiesStats.completed / activitiesStats.total) * 100)}%`, height: 6, borderRadius: 10, background: `linear-gradient(90deg, ${theme.colors.sage}, ${theme.colors.sage})` }} />
                </div>
                <span style={{ fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.midText, fontWeight: 700 }}>{activitiesStats.completed}/{activitiesStats.total}</span>
              </div>
            ) : null}
          </div>

          <div style={{ padding: '20px 20px 0' }}>
            {activitiesFeatured ? (
              <div onClick={() => setOpenActivityDetail(activitiesFeatured)} style={{ background: `linear-gradient(135deg, #E8E0F0 0%, ${theme.colors.warmWhite} 100%)`, borderRadius: 32, padding: '24px 22px', marginBottom: 20, cursor: 'pointer', border: '1.5px solid #D8D0E8', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: theme.colors.roseDark, background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>🎯 Made for {childName}</span>
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{activitiesFeatured.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: theme.fonts.serif, fontSize: 20, fontWeight: 700, color: theme.colors.charcoal, margin: '0 0 4px', lineHeight: 1.25 }}>{withChildName(activitiesFeatured.title, childName)}</h3>
                    <p style={{ fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText, margin: '0 0 10px', lineHeight: 1.4, fontStyle: 'italic' }}>{childSchemas.includes(activitiesFeatured.schema_target) ? schemaContextLine(activitiesFeatured.schema_target, childName) ?? withChildName(activitiesFeatured.subtitle, childName) : withChildName(activitiesFeatured.subtitle, childName)}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: theme.colors.midText, background: 'rgba(255,255,255,0.6)', padding: '3px 10px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 600 }}>⏱ {activitiesFeatured.duration_minutes} min</span>
                      <span style={{ fontSize: 11, color: '#fff', background: schemaBadgeColors[activitiesFeatured.schema_target] ?? theme.colors.rose, padding: '3px 10px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{formatSchemaLabel(activitiesFeatured.schema_target)}</span>
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
                    <h4 style={{ fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 700, color: theme.colors.darkText, margin: '0 0 3px' }}>{withChildName(activity.title, childName)}</h4>
                    <p style={{ fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.midText, margin: '0 0 6px', lineHeight: 1.4 }}>{childSchemas.includes(activity.schema_target) ? schemaContextLine(activity.schema_target, childName) ?? withChildName(activity.subtitle, childName) : withChildName(activity.subtitle, childName)}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: theme.colors.lightText, fontFamily: theme.fonts.sans }}>⏱ {activity.duration_minutes} min</span>
                      <span style={{ fontSize: 10, color: '#fff', background: schemaBadgeColors[activity.schema_target] ?? theme.colors.rose, padding: '2px 8px', borderRadius: 10, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{formatSchemaLabel(activity.schema_target)}</span>
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
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: theme.colors.darkText }}>{withChildName(activity.title, childName)}</span>
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
                    <span style={{ fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: theme.colors.darkText }}>{withChildName(activity.title, childName)}</span>
                    <span style={{ fontSize: 16 }}>✅</span>
                  </div>
                )) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeTab === 'profile' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
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
                <input defaultValue={locale === 'es' ? 'Mamá/Papá' : 'Dad'} style={{ width: '100%', padding: '14px 16px', borderRadius: 18, border: `1.5px solid ${theme.colors.blushMid}`, fontFamily: theme.fonts.sans, fontSize: 16, color: theme.colors.darkText }} />
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
                  <div style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: theme.colors.blushLight, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText, border: `1px solid ${theme.colors.blushMid}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {`https://www.littlewonder.ai/join/${childId.slice(0, 8)}`}
                  </div>
                  <button onClick={() => void copyInviteLink()} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: copiedInviteLink ? theme.colors.sageBg : theme.colors.charcoal, color: copiedInviteLink ? theme.colors.sage : '#fff', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    {copiedInviteLink ? (locale === 'es' ? '✓ Copiado' : '✓ Copied') : (locale === 'es' ? 'Copiar' : 'Copy')}
                  </button>
                </div>
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
              <div style={{ background: `linear-gradient(160deg, ${theme.colors.blush} 0%, ${theme.colors.blushMid} 48%, rgba(232,160,144,0.2) 100%)`, padding: '20px 20px 24px', borderRadius: '0 0 32px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.65)', border: `1px solid ${theme.colors.blushMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 26 }}>
                      {profilePhotoUrl ? <img src={profilePhotoUrl} alt={childName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🧒'}
                    </div>
                    <div>
                      <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 28, fontWeight: 700, color: theme.colors.charcoal }}>{childName}</h1>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText }}>{childAgeLabel}</span>
                        <span style={{ fontSize: 11, color: theme.colors.roseDark, background: 'rgba(255,255,255,0.6)', padding: '3px 10px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{STAGE_CONTENT.stage}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setProfileTab('settings')} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>⚙️</button>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  {[
                    { n: profileMomentsCount || profileTimeline.length, l: locale === 'es' ? 'Momentos' : 'Moments' },
                    { n: profileStreak, l: locale === 'es' ? 'Racha' : 'Streak' },
                    { n: profileInterests.length, l: locale === 'es' ? 'Intereses' : 'Interests' },
                  ].map((s) => (
                    <div key={s.l} style={{ flex: 1, background: 'rgba(255,255,255,0.6)', borderRadius: 16, padding: 10, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 21, fontWeight: 700, color: theme.colors.charcoal }}>{s.n}</p>
                      <p style={{ margin: '2px 0 0', fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.midText }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', padding: '0 20px', marginTop: 18, borderBottom: `1px solid ${theme.colors.divider}` }}>
                {(['overview', 'timeline'] as const).map((tab) => (
                  <button key={tab} onClick={() => setProfileTab(tab)} style={{ background: 'none', border: 'none', padding: '8px 16px 12px', fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: profileTab === tab ? theme.colors.roseDark : theme.colors.lightText, borderBottom: profileTab === tab ? `2px solid ${theme.colors.rose}` : '2px solid transparent' }}>{tab === 'overview' ? (locale === 'es' ? 'Resumen' : 'Overview') : (locale === 'es' ? 'Línea de Tiempo' : 'Timeline')}</button>
                ))}
              </div>

              <div style={{ padding: 20 }}>
                {profileTab === 'overview' ? (
                  <>
                    <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, border: `1px solid ${theme.colors.divider}` }}>
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.lightText }}>{locale === 'es' ? 'Frase de curiosidad' : 'Curiosity quote'}</p>
                      <p style={{ margin: '8px 0 0', fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.5, color: theme.colors.roseDark }}>
                        {profileCuriosityQuote || (locale === 'es' ? `${childName} está construyendo su mundo, un momento a la vez.` : `${childName} is building a world, one moment at a time.`)}
                      </p>
                    </div>

                    <h3 style={{ margin: '0 0 10px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>{locale === 'es' ? 'Jardín de esquemas' : 'Schema garden'}</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                      {profileSchemaStats.length === 0 ? (
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{t.profile.noSchemaData}</p>
                      ) : (
                        profileSchemaStats.map((schema, idx) => {
                          const bg = [theme.colors.lavenderBg, theme.colors.sageBg, theme.colors.blush, '#E8F0E4'][idx % 4];
                          return (
                            <div key={schema.name} style={{ background: bg, borderRadius: 16, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.darkText }}>{formatSchemaLabel(schema.name)}</span>
                              <span style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700, color: theme.colors.midText }}>{schema.count}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {profileTopSchema ? (
                      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${theme.colors.divider}`, padding: 14, marginBottom: 18 }}>
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.lightText }}>{locale === 'es' ? 'Esquema principal' : 'Top schema'}</p>
                        <p style={{ margin: '4px 0 0', fontFamily: theme.fonts.serif, fontSize: 20, color: theme.colors.charcoal }}>{formatSchemaLabel(profileTopSchema.name)}</p>
                      </div>
                    ) : null}

                    <h3 style={{ margin: '0 0 10px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>{t.profile.interests}</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                      {profileInterests.length === 0 ? (
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{locale === 'es' ? 'Aún no hay intereses guardados.' : 'No saved interests yet.'}</p>
                      ) : profileInterests.map((interest) => (
                        <span key={interest} style={{ background: theme.colors.blushLight, borderRadius: 50, padding: '8px 14px', fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.darkText }}>{interest}</span>
                      ))}
                    </div>

                    <div ref={profileBookmarksRef} tabIndex={-1} style={{ outline: 'none' }}>
                      <button onClick={() => setShowProfileBookmarks((v) => !v)} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '0 0 10px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal, cursor: 'pointer' }}>
                        🔖 {locale === 'es' ? `Artículos guardados (${savedArticles.length})` : `Saved articles (${savedArticles.length})`} {showProfileBookmarks ? '▾' : '▸'}
                      </button>
                      {showProfileBookmarks ? (
                        savedArticles.length === 0 ? (
                          <p style={{ margin: '0 0 16px', fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{locale === 'es' ? 'Aún no tienes artículos guardados.' : 'No saved articles yet.'}</p>
                        ) : (
                          <div style={{ marginBottom: 18 }}>
                            {savedArticles.map((article) => (
                              <button key={`profile-saved-${article.id}`} onClick={() => { setActiveTab('explore'); setOpenExploreArticle(article); }} style={{ width: '100%', background: '#fff', borderRadius: 14, padding: '10px 12px', marginBottom: 8, border: `1px solid ${theme.colors.divider}`, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: theme.colors.darkText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</span>
                                <span style={{ fontSize: 14 }}>🔖</span>
                              </button>
                            ))}
                          </div>
                        )
                      ) : null}
                    </div>

                    <h3 style={{ margin: '0 0 10px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>{locale === 'es' ? 'Momentos recientes' : 'Recent moments'}</h3>
                    {profileRecentMoments.length === 0 ? (
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{t.profile.noWonders}</p>
                    ) : profileRecentMoments.map((moment) => (
                      <div key={moment.id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${theme.colors.divider}`, padding: 12, marginBottom: 8 }}>
                        <p style={{ margin: '0 0 4px', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: theme.colors.charcoal }}>{moment.title}</p>
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.midText }}>{moment.observation}</p>
                      </div>
                    ))}
                  </>
                ) : null}

                {profileTab === 'timeline' ? (
                  <>
                    {profileTimeline.length === 0 ? (
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{t.profile.noWonders}</p>
                    ) : (
                      profileTimeline.map((entry, i) => {
                        const dayLabel = formatConversationDate(entry.created_at, locale);
                        const prevDayLabel = i > 0 ? formatConversationDate(profileTimeline[i - 1].created_at, locale) : null;
                        return (
                          <div key={entry.id}>
                            {i === 0 || prevDayLabel !== dayLabel ? <p style={{ margin: '16px 0 8px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.lightText, textTransform: 'uppercase', letterSpacing: 0.5 }}>{dayLabel}</p> : null}
                            <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                              <h4 style={{ margin: '0 0 6px', fontFamily: theme.fonts.serif, fontSize: 16, fontWeight: 600, color: theme.colors.charcoal }}>{entry.title}</h4>
                              <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 13, lineHeight: 1.5, color: theme.colors.midText }}>{entry.observation}</p>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {entry.schemas.map((schema) => (
                                  <span key={schema} style={{ fontSize: 10, color: theme.colors.roseDark, background: theme.colors.blushLight, padding: '2px 8px', borderRadius: 10, fontFamily: theme.fonts.sans, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>{formatSchemaLabel(schema)}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : null}

      <nav style={{ background: 'rgba(255,251,247,0.92)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${theme.colors.divider}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 26px' }}>
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
