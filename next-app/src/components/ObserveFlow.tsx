'use client';

import { useMemo, useRef, useState } from 'react';
import FadeUp from '@/components/ui/FadeUp';
import SoftButton from '@/components/ui/SoftButton';
import WonderCard from '@/components/ui/WonderCard';
import { DAILY_INSIGHT } from '@/data/daily-insights';
import { STAGE_CONTENT } from '@/data/stage-content';
import { theme } from '@/styles/theme';
import { replaceChildName } from '@/utils/personalize';

type InsightPayload = {
  title: string;
  revelation: string;
  brain_science_gem: string;
  activity: { main: string; express: string };
  observe_next: string;
  schemas_detected?: string[];
};

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'ai'; insight: InsightPayload };

type Props = {
  parentName: string;
  childName: string;
  childAgeLabel: string;
  childBirthdate: string;
  initialDailyContent?: unknown;
};

function parseInsightPayload(raw: string): InsightPayload {
  const fallback: InsightPayload = {
    title: 'A wonder in motion',
    revelation: raw,
    brain_science_gem: 'Small repeated moments build big neural architecture.',
    activity: { main: 'Repeat the same play with one tiny variation.', express: 'Name one thing they tested and pause.' },
    observe_next: 'Watch the pause before action — that is often a hypothesis.',
    schemas_detected: [],
  };

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    const p = JSON.parse(match[0]) as Partial<InsightPayload>;
    return {
      title: p.title ?? fallback.title,
      revelation: p.revelation ?? fallback.revelation,
      brain_science_gem: p.brain_science_gem ?? fallback.brain_science_gem,
      activity: {
        main: p.activity?.main ?? fallback.activity.main,
        express: p.activity?.express ?? fallback.activity.express,
      },
      observe_next: p.observe_next ?? fallback.observe_next,
      schemas_detected: p.schemas_detected ?? [],
    };
  } catch {
    return fallback;
  }
}

function withChildName(text: string, childName: string): string {
  return replaceChildName(text, childName).replaceAll('Leo', childName);
}

type Tab = 'chat' | 'explore' | 'profile';
type ProfileTab = 'overview' | 'timeline' | 'settings';

export default function ObserveFlow({ parentName, childName, childAgeLabel }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [tipExpanded, setTipExpanded] = useState(false);
  const [selectedExploreCard, setSelectedExploreCard] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<'brain' | 'activity' | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const prompts = [
    `🧱 ${childName} keeps stacking and knocking down blocks`,
    `🗣️ ${childName} pointed at something and said a new word`,
    `😤 ${childName} had a big tantrum at the store`,
    `🎭 ${childName} was pretending to cook me dinner`,
  ];

  const personalizedCards = useMemo(
    () =>
      STAGE_CONTENT.cards.map((card) => ({
        ...card,
        title: withChildName(card.title, childName),
        preview: withChildName(card.preview, childName),
        full: {
          whats_happening: withChildName(card.full.whats_happening, childName),
          youll_see_it_when: card.full.youll_see_it_when.map((v) => withChildName(v, childName)),
          fascinating_part: withChildName(card.full.fascinating_part, childName),
          how_to_be_present: withChildName(card.full.how_to_be_present, childName),
        },
      })),
    [childName]
  );

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);

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

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 0);
  };

  if (activeTab === 'explore' && selectedExploreCard !== null) {
    const card = personalizedCards[selectedExploreCard];
    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream, padding: 20 }}>
        <button onClick={() => setSelectedExploreCard(null)} style={{ background: 'none', border: 'none', fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.rose, cursor: 'pointer', padding: '0 0 20px', fontWeight: 600 }}>← Back</button>
        <h2 style={{ fontFamily: theme.fonts.serif, fontSize: 26, color: theme.colors.charcoal, margin: '0 0 14px', fontWeight: 700 }}>{card.title}</h2>
        <section style={{ background: '#fff', borderRadius: 24, padding: 20, marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.lavender }}>🔍 What&apos;s happening</p>
          <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.65, color: theme.colors.darkText }}>{card.full.whats_happening}</p>
        </section>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 390, margin: '0 auto', minHeight: '100vh', background: theme.colors.cream, boxShadow: '0 0 60px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
      {activeTab === 'chat' ? (
        <>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${theme.colors.divider}`, background: theme.colors.cream }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: theme.colors.blush, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✨</div>
              <div>
                <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 16, fontWeight: 600, color: theme.colors.charcoal }}>Little Wonder</p>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.lightText }}>{childName}&apos;s curiosity companion</p>
              </div>
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
                    <button key={prompt} onClick={() => { setInput(prompt.slice(2).trim()); textAreaRef.current?.focus(); }} style={{ background: '#fff', border: `1px solid ${theme.colors.divider}`, borderRadius: 18, padding: '12px 16px', textAlign: 'left', fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.darkText, cursor: 'pointer' }}>
                      {prompt}
                    </button>
                  ))}
                </div>
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
                      <h3 style={{ margin: '0 0 12px', fontFamily: theme.fonts.serif, fontSize: 20, fontWeight: 700, lineHeight: 1.25, color: theme.colors.charcoal }}>{msg.insight.title}</h3>

                      <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 10, borderLeft: `4px solid ${theme.colors.lavender}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.lavender }}>💡 What&apos;s really happening</p>
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.65, color: theme.colors.darkText }}>{msg.insight.revelation}</p>
                      </div>

                      <button onClick={() => setExpandedSection(expandedSection === 'brain' ? null : 'brain')} style={{ width: '100%', border: 'none', borderRadius: 18, background: theme.colors.lavenderBg, padding: '14px 16px', textAlign: 'left', marginBottom: 10 }}>
                        <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.lavender }}>🧠 The fascinating part</p>
                        {expandedSection === 'brain' ? <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.6, color: theme.colors.darkText }}>{msg.insight.brain_science_gem}</p> : null}
                      </button>

                      <button onClick={() => setExpandedSection(expandedSection === 'activity' ? null : 'activity')} style={{ width: '100%', border: 'none', borderRadius: 18, background: theme.colors.blush, padding: '14px 16px', textAlign: 'left', marginBottom: 10 }}>
                        <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.roseDark }}>🌱 Try this</p>
                        {expandedSection === 'activity' ? <p style={{ margin: '0 0 10px', fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.6, color: theme.colors.darkText }}>{msg.insight.activity.main}</p> : null}
                      </button>

                      <div style={{ background: theme.colors.sageBg, borderRadius: 18, padding: '14px 16px' }}>
                        <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.sage }}>👀 Watch for this next</p>
                        <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.5, color: theme.colors.darkText }}>{msg.insight.observe_next}</p>
                      </div>
                    </div>
                  )
                )}
                {typing ? <p style={{ fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText }}>Thinking…</p> : null}
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${theme.colors.divider}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: '#fff', borderRadius: 24, padding: '10px 12px 10px 18px', border: `1.5px solid ${theme.colors.blushMid}` }}>
              <textarea
                ref={textAreaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={`What is ${childName} doing?`}
                rows={1}
                style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.4, maxHeight: 100, minHeight: 20, background: 'transparent' }}
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
            <h2 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 20, fontWeight: 600, color: theme.colors.charcoal }}>Inside {childName}&apos;s brain</h2>
            <p style={{ margin: '0 0 14px', fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText }}>What&apos;s happening right now</p>
            {personalizedCards.map((card, idx) => (
              <WonderCard key={card.title} icon={card.icon} title={card.title} domain={card.domain} body={card.preview} delay={idx * 100} onClick={() => setSelectedExploreCard(idx)} />
            ))}
            <div style={{ background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.blushLight} 100%)`, borderRadius: 24, padding: 20, marginTop: 8 }}>
              <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.roseDark }}>🌻 Today&apos;s tip</p>
              <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.6, color: theme.colors.darkText }}>{withChildName(DAILY_INSIGHT.tip, childName)}</p>
              <div onClick={() => setTipExpanded((v) => !v)} style={{ background: '#fff', borderRadius: 12, padding: tipExpanded ? '14px 16px' : '10px 14px', cursor: 'pointer' }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.roseDark }}>💡 Why this matters</p>
                {tipExpanded ? <p style={{ margin: '10px 0 0', fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.6, color: theme.colors.midText }}>{withChildName(DAILY_INSIGHT.why, childName)}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'profile' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ background: `linear-gradient(160deg, ${theme.colors.blush} 0%, ${theme.colors.blushMid} 50%, rgba(232,160,144,0.25) 100%)`, padding: '20px 20px 24px', borderRadius: '0 0 32px 32px' }}>
            <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 28, fontWeight: 700, color: theme.colors.charcoal }}>{childName}</h1>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText }}>{childAgeLabel}</p>
          </div>
          <div style={{ display: 'flex', padding: '0 20px', marginTop: 20, borderBottom: `1px solid ${theme.colors.divider}` }}>
            {(['overview', 'timeline'] as const).map((tab) => (
              <button key={tab} onClick={() => setProfileTab(tab)} style={{ background: 'none', border: 'none', padding: '8px 16px 12px', fontFamily: theme.fonts.sans, fontSize: 14, fontWeight: 600, textTransform: 'capitalize', color: profileTab === tab ? theme.colors.roseDark : theme.colors.lightText, borderBottom: profileTab === tab ? `2px solid ${theme.colors.rose}` : '2px solid transparent' }}>{tab}</button>
            ))}
          </div>
          <div style={{ padding: 20 }}>
            {profileTab === 'overview' ? <p style={{ fontFamily: theme.fonts.sans, color: theme.colors.midText }}>Overview content</p> : null}
            {profileTab === 'timeline' ? <p style={{ fontFamily: theme.fonts.sans, color: theme.colors.midText }}>Timeline content</p> : null}
          </div>
        </div>
      ) : null}

      <nav style={{ background: 'rgba(255,251,247,0.92)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${theme.colors.divider}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 26px' }}>
        {[
          { id: 'chat' as Tab, icon: '💬', label: 'Chat' },
          { id: 'explore' as Tab, icon: '🔭', label: 'Explore' },
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
