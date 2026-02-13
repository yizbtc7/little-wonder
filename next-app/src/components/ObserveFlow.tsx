'use client';

import { useMemo, useState } from 'react';
import LogoutButton from '@/components/LogoutButton';
import FadeUp from '@/components/ui/FadeUp';
import ScaleIn from '@/components/ui/ScaleIn';
import SoftButton from '@/components/ui/SoftButton';
import WonderCard from '@/components/ui/WonderCard';
import { DAILY_INSIGHT } from '@/data/daily-insights';
import { STAGE_CONTENT } from '@/data/stage-content';
import { theme } from '@/styles/theme';
import { replaceChildName, replaceChildNameList } from '@/utils/personalize';

type InsightPayload = {
  title: string;
  revelation: string;
  brain_science_gem: string;
  activity: { main: string; express: string };
  observe_next: string;
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
    title: 'A wonder in motion',
    revelation: raw,
    brain_science_gem: 'Small repeated moments build big neural architecture.',
    activity: { main: 'Repeat the same play with one tiny variation.', express: 'Name one thing they tested and pause.' },
    observe_next: 'Watch the pause before action — that is often a hypothesis.',
  };

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    const p = JSON.parse(match[0]) as Partial<InsightPayload>;
    return {
      title: p.title ?? fallback.title,
      revelation: p.revelation ?? fallback.revelation,
      brain_science_gem: p.brain_science_gem ?? fallback.brain_science_gem,
      activity: { main: p.activity?.main ?? fallback.activity.main, express: p.activity?.express ?? fallback.activity.express },
      observe_next: p.observe_next ?? fallback.observe_next,
    };
  } catch {
    return fallback;
  }
}

function withChildName(text: string, childName: string): string {
  return replaceChildName(text, childName).replaceAll('Leo', childName);
}

export default function ObserveFlow({ parentName, childName, childAgeLabel }: Props) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [showWonder, setShowWonder] = useState<number | null>(null);
  const [tipExpanded, setTipExpanded] = useState(false);
  const [observation, setObservation] = useState('');
  const [insightObservation, setInsightObservation] = useState<string | null>(null);
  const [rawInsight, setRawInsight] = useState('');
  const [status, setStatus] = useState('');

  const parsed = useMemo(() => parseInsightPayload(rawInsight), [rawInsight]);

  const personalizedCards = useMemo(
    () =>
      STAGE_CONTENT.cards.map((card) => ({
        ...card,
        title: withChildName(card.title, childName),
        preview: withChildName(card.preview, childName),
        full: {
          whats_happening: withChildName(card.full.whats_happening, childName),
          youll_see_it_when: replaceChildNameList(card.full.youll_see_it_when, childName),
          fascinating_part: withChildName(card.full.fascinating_part, childName),
          how_to_be_present: withChildName(card.full.how_to_be_present, childName),
        },
      })),
    [childName]
  );

  const observePrompts = [
    `What is ${childName} pretending lately?`,
    `What new words surprised you?`,
    `What does ${childName} choose when free?`,
  ];

  const generateInsight = async () => {
    if (!observation.trim()) return;

    const submitted = observation.trim();
    setInsightObservation(submitted);
    setStatus('Generating wonder...');
    setShowInsight(true);

    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observation: submitted }),
    });

    if (!response.ok || !response.body) {
      setStatus('Could not generate now. Please retry.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let acc = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      setRawInsight(acc);
    }

    setStatus('Done ✨');
    setObservation('');
    setIsComposerOpen(false);
  };

  if (showWonder !== null) {
    const card = personalizedCards[showWonder];

    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream, padding: '24px 20px' }}>
        <button onClick={() => setShowWonder(null)} style={{ background: 'none', border: 'none', fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.rose, cursor: 'pointer', padding: '0 0 20px', fontWeight: 600 }}>
          ← Back
        </button>

        <FadeUp delay={100}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: theme.colors.blushLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>{card.icon}</div>
            <span style={{ fontSize: 11, color: theme.colors.roseDark, background: theme.colors.blushLight, padding: '3px 10px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>{card.domain}</span>
          </div>
          <h2 style={{ fontFamily: theme.fonts.serif, fontSize: 26, color: theme.colors.charcoal, margin: '12px 0 24px', fontWeight: 700, lineHeight: 1.2 }}>{card.title}</h2>
        </FadeUp>

        <FadeUp delay={300}>
          <section style={{ background: theme.colors.white, borderRadius: theme.radius.lg, padding: 20, marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: '0 0 10px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.colors.lavender }}>🔍 What's happening</p>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.7, color: theme.colors.darkText }}>{card.full.whats_happening}</p>
          </section>
        </FadeUp>

        <FadeUp delay={500}>
          <section style={{ background: theme.colors.white, borderRadius: theme.radius.lg, padding: 20, marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.colors.rose }}>✨ You'll see it when...</p>
            {card.full.youll_see_it_when.map((item) => (
              <div key={item} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, marginTop: 7, background: theme.colors.rose, flexShrink: 0 }} />
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.55, color: theme.colors.darkText }}>{item}</p>
              </div>
            ))}
          </section>
        </FadeUp>

        <FadeUp delay={700}>
          <section style={{ background: theme.colors.lavenderBg, borderRadius: theme.radius.lg, padding: '18px 20px', marginBottom: 14 }}>
            <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.colors.lavender }}>🧠 The fascinating part</p>
            <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 15, lineHeight: 1.6, fontWeight: 500, color: theme.colors.darkText }}>{card.full.fascinating_part}</p>
          </section>
        </FadeUp>

        <FadeUp delay={900}>
          <section style={{ background: theme.colors.sageBg, borderRadius: theme.radius.lg, padding: '18px 20px', marginBottom: 24 }}>
            <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.colors.sage }}>🤲 How to be present</p>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.65, color: theme.colors.darkText }}>{card.full.how_to_be_present}</p>
          </section>
        </FadeUp>
      </main>
    );
  }

  if (showInsight) {
    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream, padding: '24px 20px' }}>
        <button onClick={() => setShowInsight(false)} style={{ background: 'none', border: 'none', fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.rose, cursor: 'pointer', padding: '0 0 20px', fontWeight: 600 }}>
          ← Back
        </button>

        {insightObservation ? (
          <FadeUp delay={100}>
            <section style={{ background: theme.colors.blushLight, borderRadius: theme.radius.md, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.colors.lightText }}>✏️ Your observation</p>
              <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.5, color: theme.colors.darkText, fontStyle: 'italic' }}>&quot;{insightObservation}&quot;</p>
            </section>
          </FadeUp>
        ) : null}

        <FadeUp delay={300}>
          <h2 style={{ fontFamily: theme.fonts.serif, fontSize: 24, color: theme.colors.charcoal, margin: '0 0 20px', fontWeight: 700, lineHeight: 1.25 }}>{parsed.title}</h2>
        </FadeUp>

        <FadeUp delay={500}>
          <section style={{ background: theme.colors.white, borderRadius: theme.radius.lg, padding: 20, marginBottom: 14, borderLeft: `4px solid ${theme.colors.lavender}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.colors.lavender }}>💡 What's really happening</p>
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.7, color: theme.colors.darkText }}>{parsed.revelation}</p>
          </section>
        </FadeUp>

        <FadeUp delay={700}>
          <section style={{ background: theme.colors.lavenderBg, borderRadius: theme.radius.lg, padding: '18px 20px', marginBottom: 14 }}>
            <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.colors.lavender }}>🧠 The fascinating part</p>
            <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 15, lineHeight: 1.6, fontWeight: 500, color: theme.colors.darkText }}>{parsed.brain_science_gem}</p>
          </section>
        </FadeUp>

        <FadeUp delay={900}>
          <section style={{ background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.blushLight} 100%)`, borderRadius: theme.radius.lg, padding: 20, marginBottom: 14 }}>
            <p style={{ margin: '0 0 10px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.colors.roseDark }}>🌱 Try this</p>
            <p style={{ margin: '0 0 14px', fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.65, color: theme.colors.darkText }}>{parsed.activity.main}</p>
            <div style={{ background: theme.colors.white, borderRadius: theme.radius.sm, padding: '12px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <div>
                <p style={{ margin: '0 0 2px', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.roseDark }}>30-second version</p>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 13, lineHeight: 1.5, color: theme.colors.midText }}>{parsed.activity.express}</p>
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp delay={1100}>
          <section style={{ background: theme.colors.sageBg, borderRadius: theme.radius.lg, padding: '18px 20px', marginBottom: 20 }}>
            <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.colors.sage }}>👀 Watch for this next</p>
            <p style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 16, lineHeight: 1.5, fontWeight: 600, color: theme.colors.darkText }}>{parsed.observe_next}</p>
          </section>
        </FadeUp>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: theme.colors.cream, paddingBottom: 90 }}>
      <header style={{ background: `linear-gradient(160deg, ${theme.colors.blush} 0%, ${theme.colors.blushMid} 50%, rgba(232,160,144,0.25) 100%)`, padding: '28px 24px 24px', borderRadius: '0 0 32px 32px', position: 'relative' }}>
        <FadeUp delay={100}>
          <p style={{ margin: '0 0 4px', fontFamily: theme.fonts.sans, fontSize: 13, color: theme.colors.midText }}>Good morning, {parentName} 👋</p>
          <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 26, fontWeight: 700, color: theme.colors.charcoal }}>{childName}&apos;s World</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.midText }}>{childAgeLabel}</span>
            <span style={{ fontSize: 11, color: theme.colors.roseDark, background: 'rgba(255,255,255,0.6)', padding: '3px 10px', borderRadius: 20, fontFamily: theme.fonts.sans, fontWeight: 700 }}>{STAGE_CONTENT.stage}</span>
          </div>
        </FadeUp>
        <div style={{ position: 'absolute', right: 24, top: 28 }}>
          <LogoutButton />
        </div>
      </header>

      <section style={{ padding: '20px 20px 0' }}>
        <FadeUp delay={200}>
          <div onClick={() => setIsComposerOpen(true)} style={{ background: theme.colors.white, borderRadius: 24, padding: '16px 18px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: `1.5px dashed ${theme.colors.blushMid}` }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: theme.colors.blush, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✏️</div>
            <div>
              <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 15, fontWeight: 600, color: theme.colors.darkText }}>What did you see in {childName}?</p>
              <p style={{ margin: '2px 0 0', fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText }}>Describe a moment — we&apos;ll show you the science ✨</p>
            </div>
          </div>
        </FadeUp>

        {isComposerOpen ? (
          <FadeUp delay={0}>
            <div style={{ background: theme.colors.white, borderRadius: 24, padding: 20, marginBottom: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: `1.5px solid ${theme.colors.blushMid}` }}>
              <textarea value={observation} onChange={(e) => setObservation(e.target.value)} placeholder={`What is ${childName} doing right now?`} style={{ width: '100%', height: 80, border: 'none', outline: 'none', fontFamily: theme.fonts.sans, fontSize: 15, color: theme.colors.darkText, resize: 'none', background: 'transparent', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <SoftButton variant='ghost' onClick={() => setIsComposerOpen(false)}>Cancel</SoftButton>
                <SoftButton onClick={generateInsight} style={{ padding: '10px 20px' }}>See the wonder ✨</SoftButton>
              </div>
              {status ? <p style={{ margin: '8px 0 0', fontFamily: theme.fonts.sans, color: theme.colors.midText }}>{status}</p> : null}
            </div>
          </FadeUp>
        ) : null}

        <FadeUp delay={350}>
          <h2 style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 20, fontWeight: 600, color: theme.colors.charcoal }}>Inside {childName}&apos;s brain</h2>
          <p style={{ margin: '3px 0 14px', fontFamily: theme.fonts.sans, fontSize: 12, color: theme.colors.lightText }}>What&apos;s happening right now at {childAgeLabel}</p>
        </FadeUp>

        {personalizedCards.map((card, i) => (
          <WonderCard key={card.title} icon={card.icon} title={card.title} domain={card.domain} body={card.preview} delay={450 + i * 120} onClick={() => setShowWonder(i)} />
        ))}

        <FadeUp delay={850}>
          <div style={{ background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.blushLight} 100%)`, borderRadius: 24, padding: 20, marginTop: 8 }}>
            <p style={{ margin: '0 0 8px', fontFamily: theme.fonts.sans, fontSize: 11, fontWeight: 700, color: theme.colors.roseDark, letterSpacing: 0.5, textTransform: 'uppercase' }}>🌻 Today&apos;s tip</p>
            <p style={{ margin: '0 0 12px', fontFamily: theme.fonts.sans, fontSize: 15, lineHeight: 1.6, color: theme.colors.darkText }}>{withChildName(DAILY_INSIGHT.tip, childName)}</p>
            <div onClick={() => setTipExpanded((v) => !v)} style={{ background: theme.colors.white, borderRadius: 12, padding: tipExpanded ? '14px 16px' : '10px 14px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 700, color: theme.colors.roseDark }}>💡 Why this matters</p>
                <span style={{ fontSize: 12, color: theme.colors.lightText, transform: tipExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>▼</span>
              </div>
              {tipExpanded ? <p style={{ margin: '10px 0 0', fontFamily: theme.fonts.sans, fontSize: 14, lineHeight: 1.6, color: theme.colors.midText }}>{withChildName(DAILY_INSIGHT.why, childName)}</p> : null}
            </div>
            <a href={DAILY_INSIGHT.sourceUrl} target='_blank' rel='noreferrer' style={{ display: 'inline-block', marginTop: 12, fontFamily: theme.fonts.sans, fontSize: 11, color: theme.colors.lightText, textDecoration: 'none' }}>
              📚 {DAILY_INSIGHT.source}
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={950}>
          <p style={{ margin: '24px 0 12px', fontFamily: theme.fonts.serif, fontSize: 16, fontWeight: 600, color: theme.colors.darkText }}>Things to notice today</p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {observePrompts.map((prompt) => (
              <div key={prompt} onClick={() => { setIsComposerOpen(true); setObservation(''); }} style={{ background: theme.colors.white, borderRadius: 18, padding: '14px 16px', minWidth: 200, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', border: `1px solid ${theme.colors.divider}`, flexShrink: 0 }}>
                <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontSize: 14, color: theme.colors.darkText, lineHeight: 1.4 }}>{prompt}</p>
                <p style={{ margin: '6px 0 0', fontFamily: theme.fonts.sans, fontSize: 12, fontWeight: 600, color: theme.colors.rose }}>Observe →</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(255,251,247,0.92)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${theme.colors.divider}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 26px' }}>
        {[
          { icon: '🏠', label: 'Today', active: true },
          { icon: '📖', label: 'Timeline', active: false },
          { icon: '🧒', label: childName, active: false },
          { icon: '⚙️', label: 'Settings', active: false },
        ].map((tab) => (
          <div key={tab.label} style={{ textAlign: 'center', cursor: 'pointer', opacity: tab.active ? 1 : 0.35, transition: 'opacity 0.2s ease' }}>
            <span style={{ fontSize: 20, display: 'block' }}>{tab.icon}</span>
            <span style={{ fontFamily: theme.fonts.sans, fontSize: 10, letterSpacing: 0.2, color: tab.active ? theme.colors.roseDark : theme.colors.midText, fontWeight: tab.active ? 700 : 400 }}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </main>
  );
}
