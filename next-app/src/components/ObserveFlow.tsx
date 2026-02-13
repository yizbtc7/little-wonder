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

function withChildName(text: string, childName: string) {
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
        <SoftButton variant='ghost' onClick={() => setShowWonder(null)} style={{ paddingLeft: 0 }}>← Back</SoftButton>
        <FadeUp delay={100}>
          <h2 style={{ fontFamily: theme.fonts.serif, fontSize: 28, color: theme.colors.charcoal, margin: '6px 0 12px' }}>{card.title}</h2>
        </FadeUp>
        <FadeUp delay={200}><section style={{ background: '#fff', borderRadius: theme.radius.lg, padding: 18, marginBottom: 12 }}><b>🔍 What's happening</b><p>{card.full.whats_happening}</p></section></FadeUp>
        <FadeUp delay={280}><section style={{ background: '#fff', borderRadius: theme.radius.lg, padding: 18, marginBottom: 12 }}><b>✨ You'll see it when...</b><ul>{card.full.youll_see_it_when.map((i) => <li key={i}>{i}</li>)}</ul></section></FadeUp>
        <FadeUp delay={360}><section style={{ background: theme.colors.lavenderBg, borderRadius: theme.radius.lg, padding: 18, marginBottom: 12 }}><b>🧠 The fascinating part</b><p>{card.full.fascinating_part}</p></section></FadeUp>
        <FadeUp delay={440}><section style={{ background: theme.colors.sageBg, borderRadius: theme.radius.lg, padding: 18 }}><b>🤲 How to be present</b><p>{card.full.how_to_be_present}</p></section></FadeUp>
      </main>
    );
  }

  if (showInsight) {
    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream, padding: '24px 20px' }}>
        <SoftButton variant='ghost' onClick={() => setShowInsight(false)} style={{ paddingLeft: 0 }}>← Back</SoftButton>
        {insightObservation ? <section style={{ background: theme.colors.blushLight, borderRadius: theme.radius.md, padding: 14, marginBottom: 14 }}><p style={{ margin: 0, fontSize: 11 }}>✏️ Your observation</p><p style={{ margin: 0, fontStyle: 'italic' }}>{insightObservation}</p></section> : null}
        <h2 style={{ fontFamily: theme.fonts.serif, fontSize: 28 }}>{parsed.title}</h2>
        <section style={{ background: '#fff', borderRadius: theme.radius.lg, padding: 18, marginBottom: 12 }}><b>💡 What's really happening</b><p>{parsed.revelation}</p></section>
        <section style={{ background: theme.colors.lavenderBg, borderRadius: theme.radius.lg, padding: 18, marginBottom: 12 }}><b>🧠 The fascinating part</b><p>{parsed.brain_science_gem}</p></section>
        <section style={{ background: theme.colors.blush, borderRadius: theme.radius.lg, padding: 18, marginBottom: 12 }}><b>🌱 Try this</b><p>{parsed.activity.main}</p><div style={{ background: '#fff', borderRadius: theme.radius.sm, padding: 12 }}><b>⚡ 30-second version</b><p>{parsed.activity.express}</p></div></section>
        <section style={{ background: theme.colors.sageBg, borderRadius: theme.radius.lg, padding: 18 }}><b>👀 Watch for this next</b><p>{parsed.observe_next}</p></section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: theme.colors.cream, paddingBottom: 90 }}>
      <header style={{ background: `linear-gradient(160deg, ${theme.colors.blush} 0%, ${theme.colors.blushMid} 60%, ${theme.colors.cream} 100%)`, padding: '28px 24px 24px', borderRadius: '0 0 32px 32px' }}>
        <FadeUp delay={80}>
          <p style={{ margin: '0 0 4px', fontFamily: theme.fonts.sans, color: theme.colors.midText }}>Good morning, {parentName} 👋</p>
          <h1 style={{ margin: '0 0 4px', fontFamily: theme.fonts.serif, fontSize: 30, color: theme.colors.charcoal }}>{childName}'s World</h1>
          <p style={{ margin: 0, fontFamily: theme.fonts.sans, color: theme.colors.midText }}>{childAgeLabel} · {STAGE_CONTENT.stage}</p>
        </FadeUp>
        <div style={{ position: 'absolute', right: 20, top: 64 }}><LogoutButton /></div>
      </header>

      <section style={{ padding: '20px 20px 0' }}>
        <ScaleIn delay={120}>
          <div
            onClick={() => setIsComposerOpen(true)}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.blush} 0%, ${theme.colors.blushLight} 100%)`,
              borderRadius: theme.radius.lg,
              padding: 18,
              marginBottom: 22,
              border: `1.5px solid ${theme.colors.rose}`,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(196,117,106,0.12)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: -28,
                top: -28,
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.35)',
                pointerEvents: 'none',
              }}
            />
            <p style={{ margin: 0, fontFamily: theme.fonts.sans, fontWeight: 800, fontSize: 21, color: theme.colors.charcoal }}>
              What did you see in {childName}?
            </p>
            <p style={{ margin: '6px 0 0', color: theme.colors.midText, fontSize: 14, lineHeight: 1.45 }}>
              This is where the magic happens — log one moment and unlock the science behind it ✨
            </p>
            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: theme.colors.charcoal, color: '#fff', borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 700 }}>
              Start now <span>→</span>
            </div>
          </div>
        </ScaleIn>

        {isComposerOpen ? (
          <FadeUp>
            <div style={{ background: '#fff', borderRadius: theme.radius.lg, padding: 18, marginBottom: 16, border: `1.5px solid ${theme.colors.blushMid}` }}>
              <textarea value={observation} onChange={(e) => setObservation(e.target.value)} placeholder={`What is ${childName} doing right now?`} style={{ width: '100%', height: 80, border: 'none', outline: 'none', resize: 'none', fontFamily: theme.fonts.sans }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <SoftButton variant='ghost' onClick={() => setIsComposerOpen(false)}>Cancel</SoftButton>
                <SoftButton onClick={generateInsight}>See the wonder ✨</SoftButton>
              </div>
              {status ? <p style={{ margin: '8px 0 0', color: theme.colors.midText }}>{status}</p> : null}
            </div>
          </FadeUp>
        ) : null}

        <FadeUp delay={220}>
          <div style={{ background: theme.colors.warmWhite, borderRadius: theme.radius.lg, padding: 16, marginTop: 8, marginBottom: 14, border: `1px solid ${theme.colors.divider}` }}>
            <p style={{ margin: '0 0 6px', fontSize: 10, textTransform: 'uppercase', color: theme.colors.lightText, fontWeight: 700, letterSpacing: 0.4 }}>🌻 Today&apos;s tip</p>
            <p style={{ margin: '0 0 8px', color: theme.colors.darkText, fontSize: 15, lineHeight: 1.5 }}>{withChildName(DAILY_INSIGHT.tip, childName)}</p>
            <div onClick={() => setTipExpanded((v) => !v)} style={{ background: '#fff', borderRadius: theme.radius.sm, padding: 11, cursor: 'pointer', border: `1px solid ${theme.colors.divider}` }}>
              <p style={{ margin: 0, fontWeight: 700, color: theme.colors.midText }}>💡 Why this matters</p>
              {tipExpanded ? <p style={{ margin: '8px 0 0', color: theme.colors.midText, fontSize: 14, lineHeight: 1.55 }}>{withChildName(DAILY_INSIGHT.why, childName)}</p> : null}
            </div>
            <a href={DAILY_INSIGHT.sourceUrl} target='_blank' rel='noreferrer' style={{ display: 'inline-block', marginTop: 8, color: theme.colors.lightText, fontSize: 11 }}>
              {DAILY_INSIGHT.source}
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={320}>
          <h2 style={{ margin: 0, fontFamily: theme.fonts.serif, fontSize: 24, color: theme.colors.charcoal }}>What might be happening in {childName}&apos;s brain</h2>
          <p style={{ margin: '3px 0 10px', fontSize: 12, color: theme.colors.lightText }}>Science-backed possibilities based on this stage</p>
        </FadeUp>

        {personalizedCards.map((card, index) => (
          <WonderCard key={card.title} {...card} delay={400 + index * 100} body={card.preview} onClick={() => setShowWonder(index)} />
        ))}
      </section>

      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'rgba(255,251,247,0.92)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${theme.colors.divider}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 26px' }}>
        {[
          { icon: '🏠', label: 'Today', active: true },
          { icon: '📖', label: 'Timeline', active: false },
          { icon: '🧒', label: childName, active: false },
          { icon: '⚙️', label: 'Settings', active: false },
        ].map((tab) => (
          <div key={tab.label} style={{ textAlign: 'center', opacity: tab.active ? 1 : 0.35 }}>
            <span style={{ fontSize: 20, display: 'block' }}>{tab.icon}</span>
            <span style={{ fontFamily: theme.fonts.sans, fontSize: 10, color: tab.active ? theme.colors.roseDark : theme.colors.midText, fontWeight: tab.active ? 700 : 500 }}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </main>
  );
}
