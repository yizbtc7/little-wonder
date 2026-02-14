'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FadeUp from '@/components/ui/FadeUp';
import SoftButton from '@/components/ui/SoftButton';
import WonderCard from '@/components/ui/WonderCard';
import { DAILY_INSIGHT } from '@/data/daily-insights';
import { STAGE_CONTENT } from '@/data/stage-content';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { theme } from '@/styles/theme';
import { replaceChildName } from '@/utils/personalize';
import { translations, type Language } from '@/lib/translations';

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

  if (!parsedPayload.wonder && typeof parsedPayload.reply === 'string') {
    const salvaged = salvageFromStructuredText(parsedPayload.reply);
    if (salvaged?.wonder) {
      return salvaged;
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

function formatExploreTypeLabel(type: ExploreArticleRow['type']): string {
  if (type === 'guide') return 'Guide';
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

function getQuickPrompts(ageMonths: number, childName: string, locale: Language): string[] {
  if (ageMonths <= 4) {
    return [
      `🌀 ${childName} keeps staring at the ceiling fan`,
      `😊 ${childName} smiled when I talked`,
      `🤏 ${childName} grabbed my finger tightly`,
      `😢 ${childName} keeps crying and I can't tell why`,
    ];
  }

  if (ageMonths <= 8) {
    return [
      `👶 ${childName} puts everything in their mouth`,
      `🙈 ${childName} laughed so hard at peek-a-boo`,
      `📱 ${childName} keeps reaching for my phone`,
      `😭 ${childName} cried when grandma held them`,
    ];
  }

  if (ageMonths <= 14) {
    return [
      `🍽️ ${childName} keeps dropping food from the high chair`,
      `📦 ${childName} keeps putting things into boxes`,
      `👋 ${childName} waved bye-bye today`,
      `😣 ${childName} got frustrated trying to reach something`,
    ];
  }

  if (ageMonths <= 24) {
    return [
      `🧱 ${childName} keeps stacking and knocking down blocks`,
      `🗣️ ${childName} pointed at something and said a new word`,
      `😤 ${childName} had a big tantrum at the store`,
      `🎭 ${childName} was pretending to cook me dinner`,
    ];
  }

  if (ageMonths <= 48) {
    return [
      `❓ ${childName} keeps asking "why?" nonstop`,
      `✏️ ${childName} keeps drawing circles and lines`,
      `🧸 ${childName} got really upset when another kid took a toy`,
      `🧚 ${childName} told me about an imaginary friend`,
    ];
  }

  if (ageMonths <= 84) {
    return [
      `📍 ${childName} is trying to read signs everywhere`,
      `🧱 ${childName} built an elaborate Lego structure`,
      `💔 ${childName} said "nobody wants to play with me"`,
      `🔧 ${childName} keeps asking how things work`,
    ];
  }

  return locale === 'es'
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
  const [tipExpanded, setTipExpanded] = useState(false);
  const [selectedExploreCard, setSelectedExploreCard] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<'brain' | 'activity' | null>(null);
  const [signOutError, setSignOutError] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');
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
  const [openExploreArticle, setOpenExploreArticle] = useState<ExploreArticleRow | null>(null);
  const [exploreStats, setExploreStats] = useState({ total_available: 0, total_read: 0, reading_streak_days: 0 });
  const [showReadArticles, setShowReadArticles] = useState(false);
  const [articleReadPulse, setArticleReadPulse] = useState(false);
  const [openActivityDetail, setOpenActivityDetail] = useState<ActivityItem | null>(null);
  const [activitiesFeatured, setActivitiesFeatured] = useState<ActivityItem | null>(null);
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);
  const [childSchemas, setChildSchemas] = useState<string[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [profileTimeline, setProfileTimeline] = useState<ProfileWonderTimelineEntry[]>([]);
  const [profileSchemaStats, setProfileSchemaStats] = useState<ProfileSchemaStat[]>([]);
  const [locale, setLocale] = useState<Language>(initialLanguage);
  const t = translations[locale];

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createSupabaseBrowserClient();

  const prompts = useMemo(() => getQuickPrompts(getAgeMonths(childBirthdate), childName, locale), [childBirthdate, childName, locale]);

  const loadingMessages = [
    `Analyzing what ${childName} is exploring...`,
    'Connecting to developmental science...',
    'Preparing your insight...',
  ];

  const dailyQuotes = [
    'What you notice today becomes who they are tomorrow.',
    "You don't need to teach them to be curious. You just need to not accidentally stop it.",
    'The moments that drive you crazy are often the ones that matter most.',
    'Behind every \"annoying\" behavior is a brilliant experiment.',
    'Your attention is the most powerful developmental tool ever invented.',
  ];

  const quoteOfTheDay = dailyQuotes[Math.floor(Date.now() / 86400000) % 5];


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
    const sourceCards =
      exploreCards.length > 0
        ? exploreCards.map((card) => ({
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
          }))
        : (locale === 'es' ? STAGE_CONTENT_ES.cards : STAGE_CONTENT.cards);

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
        if (!response.ok) return;

        const payload = (await response.json()) as {
          featured?: ActivityItem | null;
          activities?: ActivityItem[];
          child_schemas?: string[];
        };

        setActivitiesFeatured(payload.featured ?? null);
        setActivitiesList(payload.activities ?? []);
        setChildSchemas(payload.child_schemas ?? []);
        setActivitiesLoaded(true);
      } catch {
        // ignore fetch errors in non-browser test environments
      }
    })();
  }, [activeTab, activitiesLoaded, childId, locale]);

  useEffect(() => {
    if (activeTab !== 'profile') return;
    void (async () => {
      try {
        const response = await fetch(apiUrl('/api/profile/wonders'));
        if (!response.ok) return;
        const payload = (await response.json()) as {
          timeline?: ProfileWonderTimelineEntry[];
          schema_stats?: ProfileSchemaStat[];
        };
        setProfileTimeline(payload.timeline ?? []);
        setProfileSchemaStats(payload.schema_stats ?? []);
      } catch {
        // ignore fetch errors in non-browser test environments
      }
    })();
  }, [activeTab]);

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
    const accentByType: Record<ExploreArticleRow['type'], string> = {
      article: theme.colors.rose,
      research: theme.colors.lavender,
      guide: theme.colors.sage,
    };

    const accent = accentByType[openExploreArticle.type] ?? theme.colors.rose;
    const personalizedTitle = withChildName(openExploreArticle.title, childName);
    const personalizedBody = withChildName(openExploreArticle.body, childName);
    const personalizedIntro = `For ${childName} (${childAgeLabel}), this is especially relevant right now. Use it as a lens to observe one concrete moment today and respond in a way that supports their current developmental pattern.`;

    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream }}>
        <div style={{ background: `linear-gradient(180deg, ${theme.colors.blush} 0%, ${theme.colors.cream} 100%)`, padding: '16px 24px 36px' }}>
          <button onClick={() => setOpenExploreArticle(null)} style={{ background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 50, padding: '8px 16px', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, color: theme.colors.darkText, cursor: 'pointer', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22 }}>
            <span style={{ fontSize: 14 }}>←</span> Back to Learn
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 30 }}>{openExploreArticle.emoji}</span>
            <span style={{ fontSize: 10, color: accent, background: 'rgba(255,255,255,0.65)', padding: '4px 10px', borderRadius: 10, fontFamily: theme.fonts.sans, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{formatExploreTypeLabel(openExploreArticle.type)}</span>
            {openExploreArticle.domain ? <span style={{ fontSize: 10, color: theme.colors.midText, background: 'rgba(255,255,255,0.65)', padding: '4px 10px', borderRadius: 10, fontFamily: theme.fonts.sans, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{openExploreArticle.domain}</span> : null}
            <span style={{ fontSize: 10, color: theme.colors.midText, background: 'rgba(255,255,255,0.65)', padding: '4px 10px', borderRadius: 10, fontFamily: theme.fonts.sans, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{openExploreArticle.read_time_minutes ? `${openExploreArticle.read_time_minutes} min read` : estimateReadTime(openExploreArticle.body)}</span>
          </div>

          <h1 style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 30, lineHeight: 1.15, color: theme.colors.charcoal }}>{personalizedTitle}</h1>
        </div>

        <div style={{ padding: '0 24px 40px' }}>
          <div style={{ background: '#fff', border: `1px solid ${theme.colors.divider}`, borderRadius: 16, padding: '12px 14px', marginBottom: 16 }}>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, lineHeight: 1.55, color: theme.colors.midText }}>{personalizedIntro}</p>
          </div>
          <div
            style={{ fontFamily: theme.fonts.sans, fontSize: 16, lineHeight: 1.75, color: theme.colors.darkText }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(personalizedBody) }}
          />
          {articleReadPulse ? <p style={{ margin: '8px 0 0', fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.sage, fontWeight: 700 }}>✓ Read</p> : null}
          <style>{`
            h2 { font-family: ${theme.fonts.serif}; font-size: 22px; margin: 24px 0 8px; color: ${theme.colors.charcoal}; }
            h3 { font-family: ${theme.fonts.serif}; font-size: 18px; margin: 18px 0 6px; color: ${theme.colors.charcoal}; }
            p { margin: 0 0 14px; }
            ul, ol { margin: 0 0 14px 20px; padding: 0; }
            li { margin-bottom: 6px; }
          `}</style>
        </div>
      </main>
    );
  }

  if (activeTab === 'explore' && selectedExploreCard !== null) {
    const card = personalizedCards[selectedExploreCard];

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
                  height: 44,
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
              {card.full.youll_see_it_when.map((item, i) => (
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
                <button onClick={() => setOpenWonder(null)} style={{ border: 'none', borderRadius: 50, background: 'rgba(255,255,255,0.6)', padding: '8px 16px', cursor: 'pointer', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>← Back to chat</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{ background: theme.colors.blush, color: '#E8A090', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>✨ WONDER</span>
                  {(openWonder.schemas_detected ?? []).map((schema) => (
                    <span
                      key={schema}
                      style={{
                        background: theme.colors.blush,
                        color: theme.colors.roseDark,
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
                <div style={{ margin: '0 0 24px', padding: '22px 0', borderTop: `2px solid ${theme.colors.rose}55`, borderBottom: `2px solid ${theme.colors.rose}55` }}>
                  <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontStyle: 'italic', fontWeight: 700, textAlign: 'center', fontSize: 20, color: '#2A2A2A' }}>{openWonder.article.pull_quote}</p>
                </div>
                <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.rose, textTransform: 'uppercase', letterSpacing: 0.8 }}>✨ You&apos;ll recognize it when…</p>
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
                <div style={{ background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.warmWhite} 100%)`, borderRadius: 24, padding: '24px 22px' }}>
                  <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.sage, textTransform: 'uppercase', letterSpacing: 0.8 }}>🤲 How to be present</p>
                  <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 16, lineHeight: 1.7, color: theme.colors.darkText }}>{openWonder.article.how_to_be_present}</p>
                </div>
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
          <div style={{ padding: '20px 20px 18px', borderBottom: `1px solid ${theme.colors.divider}` }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 26, fontWeight: 700, color: theme.colors.charcoal }}>{t.learn.title}</h1>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{t.learn.subtitle(childName)}</p>
          </div>
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.blushLight} 100%)`, borderRadius: 24, padding: 20, marginTop: 8, marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.roseDark }}>{t.learn.todaysTip}</p>
              <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.6, color: theme.colors.darkText }}>{withChildName(locale === 'es' && exploreDailyTip?.language !== 'es' ? DAILY_INSIGHT_ES.tip : (exploreDailyTip?.article?.tip ?? DAILY_INSIGHT.tip), childName)}</p>
              <div onClick={() => setTipExpanded((v) => !v)} style={{ background: '#fff', borderRadius: 12, padding: tipExpanded ? '14px 16px' : '10px 14px', cursor: 'pointer' }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.roseDark }}>{t.learn.whyThisMatters}</p>
                {tipExpanded ? <p style={{ margin: '10px 0 0', fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.6, color: theme.colors.midText }}>{withChildName(locale === 'es' && exploreDailyTip?.language !== 'es' ? DAILY_INSIGHT_ES.why : (exploreDailyTip?.article?.why ?? DAILY_INSIGHT.why), childName)}</p> : null}
              </div>
            </div>

            <h2 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 20, fontWeight: 600, color: theme.colors.charcoal }}>{t.learn.insideBrain(childName)}</h2>
            <p style={{ margin: '0 0 14px', fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText }}>{t.learn.whatHappeningNow}</p>
            {personalizedCards.map((card, idx) => {
              const iconBackgrounds = [theme.colors.lavenderBg, theme.colors.sageBg, theme.colors.blush, '#FDF5E6'];
              return (
                <WonderCard
                  key={card.title}
                  icon={card.icon}
                  title={card.title}
                  domain={card.domain}
                  body={card.preview}
                  delay={idx * 100}
                  iconBackground={iconBackgrounds[idx % iconBackgrounds.length]}
                  onClick={() => setSelectedExploreCard(idx)}
                />
              );
            })}

            <div style={{ background: '#fff', border: `1px solid ${theme.colors.divider}`, borderRadius: 14, padding: '10px 12px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 6px', fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>📚 {exploreStats.total_read} of {exploreStats.total_available} read</p>
              <div style={{ width: '100%', height: 4, borderRadius: 3, background: '#E9E9E9' }}>
                <div style={{ width: `${exploreStats.total_available > 0 ? Math.round((exploreStats.total_read / exploreStats.total_available) * 100) : 0}%`, height: '100%', borderRadius: 3, background: theme.colors.sage }} />
              </div>
            </div>

            <h2 style={{ margin: '18px 0 10px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>🆕 New for you</h2>
            {newForYouArticles.length === 0 ? (
              <div style={{ background: theme.colors.blushLight, borderRadius: 18, padding: '16px 14px', textAlign: 'center', marginBottom: 14 }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.midText }}>✨ You're all caught up! New articles appear as {childName} grows.</p>
                {comingNextArticles.length > 0 ? (
                  <p style={{ margin: '8px 0 0', fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText }}>Explore articles for upcoming months 🔒</p>
                ) : null}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
                {newForYouArticles.slice(0, 3).map((article, idx) => {
                  const iconBackgrounds = [theme.colors.lavenderBg, theme.colors.sageBg, theme.colors.blush, '#FDF5E6'];
                  return (
                    <button key={article.id} onClick={() => setOpenExploreArticle(article)} style={{ minWidth: 230, background: '#fff', borderRadius: 18, border: `1px solid ${theme.colors.divider}`, padding: '12px 12px', textAlign: 'left', cursor: 'pointer' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, background: iconBackgrounds[idx % iconBackgrounds.length], marginBottom: 8 }}>{article.emoji}</div>
                      <p style={{ margin: '0 0 5px', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: theme.colors.darkText }}>{article.title}</p>
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.lightText }}>{formatExploreTypeLabel(article.type)} • {article.read_time_minutes ? `${article.read_time_minutes} min read` : estimateReadTime(article.body)}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {keepReadingArticles.length > 0 ? (
              <>
                <h2 style={{ margin: '16px 0 10px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>📖 Keep reading</h2>
                {keepReadingArticles.map((article) => (
                  <button key={article.id} onClick={() => setOpenExploreArticle(article)} style={{ width: '100%', background: '#fff', borderRadius: 16, padding: '12px 14px', marginBottom: 8, border: `1px solid ${theme.colors.divider}`, textAlign: 'left', cursor: 'pointer' }}>
                    <p style={{ margin: '0 0 4px', fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: theme.colors.darkText }}>{article.title}</p>
                    <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.roseDark }}>Continue reading →</p>
                  </button>
                ))}
              </>
            ) : null}

            <h2 style={{ margin: '16px 0 10px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>🔬 Deep dives</h2>
            {deepDiveArticles.map((article, idx) => {
              const iconBackgrounds = [theme.colors.lavenderBg, theme.colors.sageBg, theme.colors.blush, '#FDF5E6'];
              return (
                <button key={article.id} onClick={() => setOpenExploreArticle(article)} style={{ width: '100%', background: '#fff', opacity: article.is_read ? 0.85 : 1, borderRadius: 16, padding: '12px 14px', marginBottom: 8, border: `1px solid ${theme.colors.divider}`, textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: iconBackgrounds[idx % iconBackgrounds.length] }}>{article.emoji}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 700, color: theme.colors.darkText }}>{article.title}</span>
                    <span style={{ display: 'block', fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.lightText }}>{article.domain ?? 'General'} • {article.read_time_minutes ? `${article.read_time_minutes} min read` : estimateReadTime(article.body)}</span>
                  </span>
                  {article.is_read ? <span style={{ color: theme.colors.sage, fontWeight: 700 }}>✓</span> : null}
                </button>
              );
            })}

            <button onClick={() => setShowReadArticles((v) => !v)} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '8px 0', cursor: 'pointer' }}>
              <span style={{ fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.midText }}>📖 {recentlyReadArticles.length} articles read {showReadArticles ? '▾' : '▸'}</span>
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

            <div style={{ background: theme.colors.lavenderBg, borderRadius: 24, padding: '18px 18px' }}>
              <p style={{ fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.roseDark, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.8 }}>🧠 The science behind this</p>
              <p style={{ fontFamily: theme.fonts.sans, fontSize: 15, color: theme.colors.darkText, margin: 0, lineHeight: 1.65 }}>{withChildName(openActivityDetail.science_note, childName)}</p>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'activities' && !openActivityDetail ? (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
          <div style={{ padding: '20px 20px 18px', borderBottom: `1px solid ${theme.colors.divider}` }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 26, fontWeight: 700, color: theme.colors.charcoal }}>{t.activities.title}</h1>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{t.activities.subtitle(childName)}</p>
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

            <h2 style={{ fontFamily: theme.fonts.serif, fontSize: 18, color: theme.colors.charcoal, margin: '0 0 12px', fontWeight: 600 }}>More to try</h2>
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
                </div>
              );
            })}
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
                <input defaultValue={'Dad'} style={{ width: '100%', padding: '14px 16px', borderRadius: 18, border: `1.5px solid ${theme.colors.blushMid}`, fontFamily: theme.fonts.sans, fontSize: 16, color: theme.colors.darkText }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: theme.colors.darkText }}>{t.settings.language}</label>
                <select value={locale} onChange={(e) => void saveLanguage(e.target.value as Language)} style={{ width: '100%', padding: '14px 16px', borderRadius: 18, border: `1.5px solid ${theme.colors.blushMid}`, fontFamily: theme.fonts.sans, fontSize: 16, color: theme.colors.darkText }}>
                  <option value='es'>{t.settings.spanish}</option>
                  <option value='en'>{t.settings.english}</option>
                </select>
              </div>
              <SoftButton variant='soft' full onClick={() => void handleSignOut()} style={{ color: theme.colors.roseDark }}>{t.settings.signOut}</SoftButton>
              {settingsStatus ? <p style={{ marginTop: 10, fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.sage }}>{settingsStatus}</p> : null}
              {signOutError ? <p style={{ marginTop: 10, fontFamily: theme.fonts.sans, fontSize: 12, color: 'crimson' }}>{signOutError}</p> : null}
            </div>
          ) : (
            <>
              <div style={{ background: `linear-gradient(160deg, ${theme.colors.blush} 0%, ${theme.colors.blushMid} 50%, rgba(232,160,144,0.25) 100%)`, padding: '20px 20px 24px', borderRadius: '0 0 32px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 28, fontWeight: 700, color: theme.colors.charcoal }}>{childName}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText }}>{childAgeLabel}</span>
                      <span style={{ fontSize: 11, color: theme.colors.roseDark, background: 'rgba(255,255,255,0.6)', padding: '3px 10px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{STAGE_CONTENT.stage}</span>
                    </div>
                  </div>
                  <button onClick={() => setProfileTab('settings')} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>⚙️</button>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                  {[
                    { n: profileTimeline.length, l: t.profile.wonders },
                    { n: profileSchemaStats.length, l: t.profile.schemas },
                    { n: new Set(profileTimeline.map((entry) => new Date(entry.created_at).toDateString())).size, l: t.profile.days },
                  ].map((s) => (
                    <div key={s.l} style={{ flex: 1, background: 'rgba(255,255,255,0.5)', borderRadius: 18, padding: 12, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 22, fontWeight: 700, color: theme.colors.charcoal }}>{s.n}</p>
                      <p style={{ margin: '2px 0 0', fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.midText }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', padding: '0 20px', marginTop: 20, borderBottom: `1px solid ${theme.colors.divider}` }}>
                {(['overview', 'timeline'] as const).map((tab) => (
                  <button key={tab} onClick={() => setProfileTab(tab)} style={{ background: 'none', border: 'none', padding: '8px 16px 12px', fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 600, textTransform: 'capitalize', color: profileTab === tab ? theme.colors.roseDark : theme.colors.lightText, borderBottom: profileTab === tab ? `2px solid ${theme.colors.rose}` : '2px solid transparent' }}>{tab === 'overview' ? t.profile.overview : t.profile.timeline}</button>
                ))}
              </div>

              <div style={{ padding: 20 }}>
                {profileTab === 'overview' ? (
                  <>
                    <h3 style={{ margin: '0 0 12px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>{t.profile.schemasDetected}</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                      {profileSchemaStats.length === 0 ? (
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>{t.profile.noSchemaData}</p>
                      ) : (
                        profileSchemaStats.map((schema, idx) => {
                          const bg = [theme.colors.lavenderBg, theme.colors.sageBg, theme.colors.blush, '#E8F0E4'][idx % 4];
                          return (
                            <div key={schema.name} style={{ background: bg, borderRadius: 18, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, color: theme.colors.darkText }}>{formatSchemaLabel(schema.name)}</span>
                              <span style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: theme.colors.midText }}>{schema.count}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <h3 style={{ margin: '0 0 12px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>{t.profile.interests}</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['🎵 Music', '📦 Stacking', '🐛 Animals', '📚 Books'].map((interest) => (
                        <span key={interest} style={{ background: theme.colors.blushLight, borderRadius: 50, padding: '8px 14px', fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.darkText }}>{interest}</span>
                      ))}
                    </div>
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

      <nav style={{ background: 'rgba(255,251,247,0.92)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${theme.colors.divider}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 26px' }}>
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
