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

type WonderPayload = {
  title: string;
  article: {
    lead: string;
    pull_quote: string;
    signs: string[];
    how_to_be_present: string;
  };
  schemas_detected?: string[];
};

type InsightPayload = {
  reply?: string;
  wonder?: WonderPayload | null;
  title?: string;
  revelation?: string;
  brain_science_gem?: string;
  activity?: { main: string; express: string };
  observe_next?: string;
  schemas_detected?: string[];
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
};

type ExploreBrainCardRow = {
  id: string;
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
  article: {
    tip: string;
    why: string;
    source: string;
  };
  source?: string;
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
  initialDailyContent?: unknown;
};

function parseInsightPayload(raw: string): InsightPayload {
  const fallback: InsightPayload = {
    reply: raw,
    wonder: null,
    title: 'A wonder in motion',
    revelation: raw,
    brain_science_gem: 'Small repeated moments build big neural architecture.',
    activity: { main: 'Repeat the same play with one tiny variation.', express: 'Name one thing they tested and pause.' },
    observe_next: 'Watch the pause before action — that is often a hypothesis.',
    schemas_detected: [],
  };

  const parseCandidate = (input: string): Partial<InsightPayload> | null => {
    try {
      const match = input.match(/\{[\s\S]*\}/);
      if (!match) return null;
      return JSON.parse(match[0]) as Partial<InsightPayload>;
    } catch {
      return null;
    }
  };

  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^json\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  let parsed =
    parseCandidate(cleaned) ??
    parseCandidate(cleaned.replaceAll('\\"', '"').replaceAll('\\n', '\n').replaceAll('\\t', '\t'));

  if (!parsed && cleaned.startsWith('"') && cleaned.endsWith('"')) {
    const unquoted = cleaned.slice(1, -1).replaceAll('\\"', '"').replaceAll('\\n', '\n');
    parsed = parseCandidate(unquoted);
  }

  if (!parsed) return fallback;

  if (!parsed.wonder && typeof parsed.reply === 'string' && parsed.reply.includes('"wonder"')) {
    const nested = parseCandidate(parsed.reply.replaceAll('\\"', '"').replaceAll('\\n', '\n'));
    if (nested) {
      parsed = { ...parsed, ...nested };
    }
  }

  if (!parsed.wonder && parsed.title && (parsed as { article?: WonderPayload['article']; schemas_detected?: string[] }).article) {
    const legacy = parsed as { title?: string; article?: WonderPayload['article']; schemas_detected?: string[] };
    parsed.wonder = {
      title: legacy.title ?? 'New Wonder',
      article: legacy.article!,
      schemas_detected: legacy.schemas_detected ?? [],
    };
  }

  const replyText = (parsed.reply ?? fallback.reply ?? '').toString();
  const conciseReply = replyText.length > 700 ? `${replyText.slice(0, 680).trim()}…` : replyText;

  return {
    reply: conciseReply,
    wonder: parsed.wonder ?? null,
    title: parsed.title ?? fallback.title,
    revelation: parsed.revelation ?? fallback.revelation,
    brain_science_gem: parsed.brain_science_gem ?? fallback.brain_science_gem,
    activity: {
      main: parsed.activity?.main ?? fallback.activity?.main ?? '',
      express: parsed.activity?.express ?? fallback.activity?.express ?? '',
    },
    observe_next: parsed.observe_next ?? fallback.observe_next,
    schemas_detected: parsed.schemas_detected ?? [],
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

function formatConversationDate(dateInput: string, locale: 'en' | 'es'): string {
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

function deserializeAssistantInsight(content: string): InsightPayload {
  try {
    const parsed = JSON.parse(content) as Partial<InsightPayload>;
    if (!parsed || typeof parsed !== 'object') return parseInsightPayload(content);

    if (parsed.reply || parsed.wonder) {
      if (typeof parsed.reply === 'string') {
        const nestedFromReply = parseInsightPayload(parsed.reply);
        if (nestedFromReply.wonder || nestedFromReply.reply !== parsed.reply) {
          return nestedFromReply;
        }
      }

      if (typeof parsed.revelation === 'string' && parsed.revelation.includes('"reply"')) {
        const nestedFromRevelation = parseInsightPayload(parsed.revelation);
        if (nestedFromRevelation.wonder || nestedFromRevelation.reply.length > 0) {
          return nestedFromRevelation;
        }
      }

      return {
        reply: parsed.reply ?? '',
        wonder: parsed.wonder ?? null,
        title: parsed.title,
        revelation: parsed.revelation,
        brain_science_gem: parsed.brain_science_gem,
        activity: parsed.activity,
        observe_next: parsed.observe_next,
        schemas_detected: Array.isArray(parsed.schemas_detected) ? parsed.schemas_detected : [],
      };
    }

    if (typeof parsed.revelation === 'string' && parsed.revelation.includes('"reply"')) {
      return parseInsightPayload(parsed.revelation);
    }

    return {
      title: parsed.title ?? 'A wonder in motion',
      revelation: parsed.revelation ?? '',
      brain_science_gem: parsed.brain_science_gem ?? '',
      activity: {
        main: parsed.activity?.main ?? '',
        express: parsed.activity?.express ?? '',
      },
      observe_next: parsed.observe_next ?? '',
      schemas_detected: Array.isArray(parsed.schemas_detected) ? parsed.schemas_detected : [],
    };
  } catch {
    return parseInsightPayload(content);
  }
}

type Tab = 'chat' | 'explore' | 'activities' | 'profile';
type ProfileTab = 'overview' | 'timeline' | 'settings';

function getAgeMonths(birthdate: string): number {
  if (!birthdate) return 22;
  const now = new Date();
  const b = new Date(birthdate);
  return (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
}

function getQuickPrompts(ageMonths: number, childName: string): string[] {
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

  return [
    `📺 ${childName} only wants to watch YouTube lately`,
    `📚 ${childName} is struggling with homework`,
    `🎮 ${childName} is obsessed with one game`,
    `🌌 ${childName} asked me a really deep question`,
  ];
}

export default function ObserveFlow({ parentName, childName, childAgeLabel, childBirthdate }: Props) {
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
  const [showSidebar, setShowSidebar] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [openWonder, setOpenWonder] = useState<WonderPayload | null>(null);
  const [exploreCards, setExploreCards] = useState<ExploreBrainCardRow[]>([]);
  const [exploreDailyTip, setExploreDailyTip] = useState<ExploreDailyTipRow | null>(null);
  const [profileTimeline, setProfileTimeline] = useState<ProfileWonderTimelineEntry[]>([]);
  const [profileSchemaStats, setProfileSchemaStats] = useState<ProfileSchemaStat[]>([]);
  const [locale, setLocale] = useState<'en' | 'es'>('en');

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createSupabaseBrowserClient();

  const prompts = useMemo(() => getQuickPrompts(getAgeMonths(childBirthdate), childName), [childBirthdate, childName]);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = (localStorage.getItem('locale') || localStorage.getItem('language') || '').toLowerCase();
    if (saved.startsWith('es')) {
      setLocale('es');
      return;
    }
    const navLang = window.navigator.language?.toLowerCase() ?? 'en';
    setLocale(navLang.startsWith('es') ? 'es' : 'en');
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
        : STAGE_CONTENT.cards;

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
  }, [childName, exploreCards]);

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
    void (async () => {
      try {
        const response = await fetch(apiUrl('/api/explore'));
        if (!response.ok) return;
        const payload = (await response.json()) as {
          brain_cards?: ExploreBrainCardRow[];
          daily_tip?: ExploreDailyTipRow | null;
        };
        setExploreCards(payload.brain_cards ?? []);
        setExploreDailyTip(payload.daily_tip ?? null);
      } catch {
        // ignore fetch errors in non-browser test environments
      }
    })();
  }, [activeTab]);

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
                <button onClick={() => setOpenWonder(null)} style={{ border: 'none', borderRadius: 50, background: 'rgba(255,255,255,0.6)', padding: '8px 16px', cursor: 'pointer', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>← Back to chat</button>
                <p style={{ margin: '0 0 10px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: theme.colors.roseDark, textTransform: 'uppercase', letterSpacing: 0.5 }}>✨ Wonder</p>
                <h1 style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 30, lineHeight: 1.15, color: theme.colors.charcoal }}>{openWonder.title}</h1>
              </div>
              <div style={{ padding: '0 24px 40px' }}>
                <p style={{ margin: '0 0 24px', fontFamily: theme.fonts.sans, fontSize: 16, lineHeight: 1.75, color: theme.colors.darkText }}>{openWonder.article.lead}</p>
                <div style={{ margin: '0 0 24px', padding: '22px 0', borderTop: `2px solid ${theme.colors.rose}55`, borderBottom: `2px solid ${theme.colors.rose}55` }}>
                  <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontStyle: 'italic', textAlign: 'center', fontSize: 19, color: theme.colors.charcoal }}>{openWonder.article.pull_quote}</p>
                </div>
                <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.rose, textTransform: 'uppercase', letterSpacing: 0.8 }}>✨ You&apos;ll recognize it when…</p>
                <div style={{ marginBottom: 24 }}>
                  {openWonder.article.signs.map((sign, index) => (
                    <div key={index} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: theme.colors.blush, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, color: theme.colors.roseDark }}>{index + 1}</div>
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.6, color: theme.colors.darkText }}>{sign}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.warmWhite} 100%)`, borderRadius: 24, padding: '24px 22px' }}>
                  <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.sage, textTransform: 'uppercase', letterSpacing: 0.8 }}>🤲 How to be present</p>
                  <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 16, lineHeight: 1.7, color: theme.colors.darkText }}>{openWonder.article.how_to_be_present}</p>
                </div>
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
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.darkText, lineHeight: 1.4 }}>{conversation.preview || 'New conversation'}</p>
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
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.lightText }}>{childName}&apos;s curiosity companion</p>
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
                <h2 style={{ margin: '0 0 8px', fontFamily: theme.fonts.serif, fontSize: 24, fontWeight: 600, color: theme.colors.charcoal }}>Hi {parentName} 👋</h2>
                <p style={{ margin: '0 0 36px', fontFamily: theme.fonts.sans, fontSize: 15, color: theme.colors.midText, lineHeight: 1.5 }}>Tell me what {childName} is up to. I&apos;ll show you the science behind it.</p>
                <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.lightText, textTransform: 'uppercase', letterSpacing: 0.5 }}>Try one of these</p>
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
                      {msg.insight.reply ? (
                        <>
                          <FadeUp delay={120}>
                            <div style={{ background: '#fff', borderRadius: '20px 20px 20px 4px', padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 10 }}>
                              <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.7, color: theme.colors.darkText }}>{msg.insight.reply}</p>
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
                                        {schema}
                                      </span>
                                    ))}
                                  </div>
                                  <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, color: theme.colors.rose }}>Read →</span>
                                </div>
                              </button>
                            </FadeUp>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <FadeUp delay={80}>
                            <h3 style={{ margin: '0 0 12px', fontFamily: theme.fonts.serif, fontSize: 20, fontWeight: 700, lineHeight: 1.25, color: theme.colors.charcoal }}>{msg.insight.title}</h3>
                          </FadeUp>

                          <FadeUp delay={180}>
                            <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 10, borderLeft: `4px solid ${theme.colors.lavender}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                              <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.lavender }}>💡 What&apos;s really happening</p>
                              <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.65, color: theme.colors.darkText }}>{msg.insight.revelation}</p>
                            </div>
                          </FadeUp>
                        </>
                      )}
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
                placeholder={`What is ${childName} doing?`}
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
            <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 26, fontWeight: 700, color: theme.colors.charcoal }}>Explore</h1>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>Discover what&apos;s happening at {childAgeLabel}</p>
          </div>
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.blushLight} 100%)`, borderRadius: 24, padding: 20, marginTop: 8, marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.roseDark }}>🌻 Today&apos;s tip</p>
              <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.6, color: theme.colors.darkText }}>{withChildName(exploreDailyTip?.article?.tip ?? DAILY_INSIGHT.tip, childName)}</p>
              <div onClick={() => setTipExpanded((v) => !v)} style={{ background: '#fff', borderRadius: 12, padding: tipExpanded ? '14px 16px' : '10px 14px', cursor: 'pointer' }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.roseDark }}>💡 Why this matters</p>
                {tipExpanded ? <p style={{ margin: '10px 0 0', fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.6, color: theme.colors.midText }}>{withChildName(exploreDailyTip?.article?.why ?? DAILY_INSIGHT.why, childName)}</p> : null}
              </div>
            </div>

            <h2 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 20, fontWeight: 600, color: theme.colors.charcoal }}>Inside {childName}&apos;s brain</h2>
            <p style={{ margin: '0 0 14px', fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText }}>What&apos;s happening right now</p>
            {personalizedCards.map((card, idx) => (
              <WonderCard key={card.title} icon={card.icon} title={card.title} domain={card.domain} body={card.preview} delay={idx * 100} onClick={() => setSelectedExploreCard(idx)} />
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'activities' ? (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
          <div style={{ padding: '20px 20px 18px', borderBottom: `1px solid ${theme.colors.divider}` }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 26, fontWeight: 700, color: theme.colors.charcoal }}>Activities</h1>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>Simple ways to support {childName}&apos;s growth today</p>
          </div>
          <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                icon: '🧱',
                title: 'Stack & crash lab',
                body: `Build a short tower with ${childName}, then change one block and test what happens.`,
              },
              {
                icon: '🗣️',
                title: 'Point, name, pause',
                body: `When ${childName} points, name the object and pause 3 seconds for a response.`,
              },
              {
                icon: '🎭',
                title: 'Pretend kitchen story',
                body: `Follow ${childName}'s pretend play script and add one simple back-and-forth turn.`,
              },
            ].map((activity) => (
              <div key={activity.title} style={{ background: '#fff', border: `1px solid ${theme.colors.divider}`, borderRadius: 18, padding: '14px 16px' }}>
                <p style={{ margin: '0 0 6px', fontFamily: theme.fonts.serif, fontSize: 18, color: theme.colors.charcoal }}>{activity.icon} {activity.title}</p>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.55, color: theme.colors.midText }}>{activity.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'profile' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {profileTab === 'settings' ? (
            <div style={{ padding: 20 }}>
              <button onClick={() => setProfileTab('overview')} style={{ background: 'none', border: 'none', fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.rose, cursor: 'pointer', padding: '0 0 20px', fontWeight: 600 }}>← Back</button>
              <h1 style={{ margin: '0 0 24px', fontFamily: theme.fonts.serif, fontSize: 26, fontWeight: 700, color: theme.colors.charcoal }}>Settings</h1>
              {[
                { label: 'Your name', value: parentName },
                { label: 'Role', value: 'Dad' },
                { label: 'Language', value: 'English' },
              ].map((field) => (
                <div key={field.label} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: theme.colors.darkText }}>{field.label}</label>
                  <input defaultValue={field.value} style={{ width: '100%', padding: '14px 16px', borderRadius: 18, border: `1.5px solid ${theme.colors.blushMid}`, fontFamily: theme.fonts.sans, fontSize: 16, color: theme.colors.darkText }} />
                </div>
              ))}
              <SoftButton variant='soft' full onClick={() => void handleSignOut()} style={{ color: theme.colors.roseDark }}>Sign Out</SoftButton>
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
                    { n: profileTimeline.length, l: 'Wonders' },
                    { n: profileSchemaStats.length, l: 'Schemas' },
                    { n: new Set(profileTimeline.map((entry) => new Date(entry.created_at).toDateString())).size, l: 'Days' },
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
                  <button key={tab} onClick={() => setProfileTab(tab)} style={{ background: 'none', border: 'none', padding: '8px 16px 12px', fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 600, textTransform: 'capitalize', color: profileTab === tab ? theme.colors.roseDark : theme.colors.lightText, borderBottom: profileTab === tab ? `2px solid ${theme.colors.rose}` : '2px solid transparent' }}>{tab}</button>
                ))}
              </div>

              <div style={{ padding: 20 }}>
                {profileTab === 'overview' ? (
                  <>
                    <h3 style={{ margin: '0 0 12px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>Schemas detected</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                      {profileSchemaStats.length === 0 ? (
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>No schema data yet.</p>
                      ) : (
                        profileSchemaStats.map((schema, idx) => {
                          const bg = [theme.colors.lavenderBg, theme.colors.sageBg, theme.colors.blush, '#E8F0E4'][idx % 4];
                          return (
                            <div key={schema.name} style={{ background: bg, borderRadius: 18, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, color: theme.colors.darkText }}>{schema.name}</span>
                              <span style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: theme.colors.midText }}>{schema.count}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <h3 style={{ margin: '0 0 12px', fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: 600, color: theme.colors.charcoal }}>Interests</h3>
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
                      <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.lightText }}>No wonders yet. Capture a chat observation to generate your first wonder.</p>
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
                                  <span key={schema} style={{ fontSize: 10, color: theme.colors.roseDark, background: theme.colors.blushLight, padding: '2px 8px', borderRadius: 10, fontFamily: theme.fonts.sans, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>{schema}</span>
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
          { id: 'chat' as Tab, icon: '💬', label: 'Chat' },
          { id: 'explore' as Tab, icon: '🔭', label: 'Explore' },
          { id: 'activities' as Tab, icon: '🎯', label: 'Activities' },
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
