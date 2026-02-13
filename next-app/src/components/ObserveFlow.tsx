'use client';

import { useMemo, useState } from 'react';
import LogoutButton from '@/components/LogoutButton';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/ui/FadeIn';
import WonderCard from '@/components/ui/WonderCard';
import { theme } from '@/styles/theme';

type InsightCard = {
  id: string;
  content: string;
  created_at: string;
  schema_detected: string | null;
  domain: string | null;
};

type ObserveFlowProps = {
  parentName: string;
  childName: string;
  childAgeLabel: string;
  childBirthdate: string;
  insights: InsightCard[];
};

type StageWonder = {
  icon: string;
  title: string;
  body: string;
  domain: string;
};

type StageContent = {
  stage: string;
  tip: string;
  observePrompts: string[];
  dailyWonders: StageWonder[];
};

function getAgeMonths(birthdate: string): number {
  const now = new Date();
  const birth = new Date(birthdate);
  return (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
}

function getStageContent(ageMonths: number, childName: string): StageContent {
  if (ageMonths <= 14) {
    return {
      stage: 'Little Physicist',
      tip: `${childName} may have a repeated play schema. Look for patterns like dropping, filling, rotating, or lining up. Those patterns are deep learning in motion.`,
      observePrompts: [
        `What does ${childName} do over and over again?`,
        `What new thing did ${childName} figure out this week?`,
        `What frustrates ${childName} right now?`,
      ],
      dailyWonders: [
        {
          icon: '⬇️',
          title: 'The Drop Experiment',
          body: `${childName} isn’t just dropping objects. They are testing gravity, sound, and your social response in one integrated experiment loop.`,
          domain: 'Scientific Thinking',
        },
        {
          icon: '📦',
          title: 'Container Play',
          body: `Putting things in and taking them out trains spatial reasoning, categories, and early math logic. ${childName} is mapping “inside” and “outside.”`,
          domain: 'Spatial Reasoning',
        },
        {
          icon: '🚶',
          title: 'Movement & Independence',
          body: `Mobility gives ${childName} agency. Choosing where to go and what to explore transforms curiosity into self-directed learning.`,
          domain: 'Motor & Cognitive',
        },
      ],
    };
  }

  return {
    stage: 'World Builder',
    tip: `Follow ${childName}’s lead and narrate what you see. That combination builds language and confidence at the same time.`,
    observePrompts: [
      `What is ${childName} pretending lately?`,
      `What phrase did ${childName} repeat today?`,
      `What does ${childName} choose during free play?`,
    ],
    dailyWonders: [
      {
        icon: '💬',
        title: 'Language in Action',
        body: `${childName} is absorbing language rapidly. Every narration you give becomes raw material for future expression.`,
        domain: 'Language',
      },
      {
        icon: '🎭',
        title: 'Pretend Thinking',
        body: `When ${childName} uses one object to represent another, they are training abstract thought and symbolic reasoning.`,
        domain: 'Cognitive',
      },
      {
        icon: '🤝',
        title: 'Social Mapping',
        body: `${childName} is learning that other people have feelings, intentions, and perspectives — the foundation of empathy.`,
        domain: 'Social-Emotional',
      },
    ],
  };
}

export default function ObserveFlow({ parentName, childName, childAgeLabel, childBirthdate, insights }: ObserveFlowProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showInsightScreen, setShowInsightScreen] = useState(false);
  const [observation, setObservation] = useState('');
  const [latestInsight, setLatestInsight] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ageMonths = getAgeMonths(childBirthdate);
  const stageContent = useMemo(() => getStageContent(ageMonths, childName), [ageMonths, childName]);

  const historicalWonders = insights.map((item) => ({
    icon: '✨',
    title: item.domain ?? 'Moment of Wonder',
    body: item.content,
    domain: item.schema_detected ?? stageContent.stage,
  }));

  const allWonders = latestInsight
    ? [
        {
          icon: '💡',
          title: 'Latest Insight',
          body: latestInsight,
          domain: stageContent.stage,
        },
        ...historicalWonders,
      ]
    : historicalWonders;

  const generateInsight = async () => {
    if (!observation.trim()) {
      setStatus('Write an observation first.');
      return;
    }

    setIsLoading(true);
    setStatus('Generating wonder...');
    setLatestInsight('');

    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observation: observation.trim() }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as { error?: string };
        setStatus(errorPayload.error ?? 'Could not generate insight.');
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        setStatus('No response body received.');
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      setShowInsightScreen(true);
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setLatestInsight(accumulated);
      }

      setStatus('Done ✨');
      setObservation('');
      setIsComposerOpen(false);
    } catch {
      setStatus('Request failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showInsightScreen) {
    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream, padding: '24px 20px' }}>
        <Button variant="ghost" onClick={() => setShowInsightScreen(false)} style={{ marginBottom: 12 }}>
          ← Back to today
        </Button>

        <FadeIn>
          <div
            style={{
              background: theme.colors.white,
              borderRadius: theme.radius.card,
              padding: 22,
              boxShadow: theme.shadows.elevated,
              borderLeft: `4px solid ${theme.colors.brand}`,
            }}
          >
            <p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.grayLight, fontWeight: 700, marginBottom: 8 }}>
              WHAT&apos;S HAPPENING RIGHT NOW
            </p>
            <article style={{ whiteSpace: 'pre-wrap', color: theme.colors.dark, lineHeight: 1.6, fontFamily: theme.fonts.body, fontSize: 15 }}>
              {latestInsight || 'Generating insight...'}
            </article>
          </div>
        </FadeIn>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: theme.colors.cream, paddingBottom: 96 }}>
      <header
        style={{
          background: `linear-gradient(135deg, ${theme.colors.brand} 0%, ${theme.colors.brandDark} 100%)`,
          padding: '32px 24px 28px',
          borderRadius: '0 0 28px 28px',
        }}
      >
        <FadeIn delay={80}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                Good morning, {parentName} 👋
              </p>
              <h1 style={{ color: theme.colors.white, fontSize: 42, lineHeight: 1.1 }}>{childName}&apos;s World Today</h1>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                {childAgeLabel} · {stageContent.stage}
              </p>
            </div>
            <LogoutButton />
          </div>
        </FadeIn>
      </header>

      <section style={{ padding: '20px 20px 0' }}>
        <FadeIn delay={150}>
          <button
            onClick={() => setIsComposerOpen(true)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: theme.colors.white,
              borderRadius: theme.radius.card,
              padding: '16px 18px',
              marginBottom: 14,
              boxShadow: theme.shadows.subtle,
              border: `1.5px dashed ${theme.colors.grayBg}`,
              cursor: 'pointer',
            }}
          >
            <p style={{ fontFamily: theme.fonts.body, fontSize: 15, color: theme.colors.dark, fontWeight: 600 }}>
              What&apos;s {childName} up to?
            </p>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.grayLight, marginTop: 2 }}>Log a moment of wonder</p>
          </button>
        </FadeIn>

        {isComposerOpen ? (
          <FadeIn>
            <div
              style={{
                background: theme.colors.white,
                borderRadius: theme.radius.card,
                padding: 20,
                marginBottom: 16,
                boxShadow: theme.shadows.elevated,
                border: `1.5px solid ${theme.colors.brandLight}`,
              }}
            >
              <textarea
                autoFocus
                value={observation}
                onChange={(event) => setObservation(event.target.value)}
                placeholder={stageContent.observePrompts[0]}
                style={{
                  width: '100%',
                  height: 90,
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: theme.fonts.body,
                  fontSize: 16,
                  color: theme.colors.dark,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <Button variant="ghost" onClick={() => setIsComposerOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateInsight} disabled={isLoading || !observation.trim()}>
                  See the wonder ✨
                </Button>
              </div>
              {status ? <p style={{ marginTop: 8, color: theme.colors.gray, fontSize: 14 }}>{status}</p> : null}
            </div>
          </FadeIn>
        ) : null}

        <FadeIn delay={220}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 34, color: theme.colors.dark }}>Today&apos;s Wonders</h2>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.grayLight }}>
                What {childName}&apos;s brain is up to right now
              </p>
            </div>
            <span
              style={{
                fontSize: 12,
                color: theme.colors.brand,
                background: theme.colors.brandLight,
                padding: '4px 12px',
                borderRadius: theme.radius.chip,
                fontFamily: theme.fonts.body,
                fontWeight: 600,
              }}
            >
              {stageContent.stage}
            </span>
          </div>
        </FadeIn>

        {allWonders.length === 0
          ? stageContent.dailyWonders.map((wonder, index) => (
              <WonderCard key={`${wonder.title}-${index}`} {...wonder} delay={300 + index * 90} />
            ))
          : allWonders.map((wonder, index) => <WonderCard key={`${wonder.title}-${index}`} {...wonder} delay={300 + index * 80} />)}

        <FadeIn delay={650}>
          <div
            style={{
              background: `linear-gradient(135deg, ${theme.colors.warm} 0%, #F7EDE0 100%)`,
              borderRadius: theme.radius.card,
              padding: 20,
              marginTop: 8,
              marginBottom: 14,
            }}
          >
            <p style={{ fontFamily: theme.fonts.body, fontSize: 13, fontWeight: 700, color: theme.colors.warmDark, marginBottom: 8 }}>
              TODAY&apos;S PARENTING INSIGHT
            </p>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.dark, lineHeight: 1.6 }}>{stageContent.tip}</p>
          </div>
        </FadeIn>

        <FadeIn delay={720}>
          <p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 700, color: theme.colors.dark, marginBottom: 10 }}>
            Things to notice today
          </p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {stageContent.observePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setIsComposerOpen(true);
                  setObservation('');
                }}
                style={{
                  background: theme.colors.white,
                  borderRadius: 14,
                  padding: '14px 16px',
                  minWidth: 220,
                  boxShadow: theme.shadows.subtle,
                  border: `1px solid ${theme.colors.grayBg}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.dark, lineHeight: 1.4 }}>{prompt}</p>
                <p style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.brand, marginTop: 6, fontWeight: 600 }}>
                  Tap to observe →
                </p>
              </button>
            ))}
          </div>
        </FadeIn>
      </section>

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 390,
          background: theme.colors.white,
          borderTop: `1px solid ${theme.colors.grayBg}`,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 0 24px',
        }}
      >
        {[
          { icon: '🏠', label: 'Today', active: true },
          { icon: '📋', label: 'Timeline', active: false },
          { icon: '🧒', label: childName, active: false },
          { icon: '⚙️', label: 'Settings', active: false },
        ].map((tab) => (
          <div key={tab.label} style={{ textAlign: 'center', opacity: tab.active ? 1 : 0.45 }}>
            <span style={{ fontSize: 20, display: 'block' }}>{tab.icon}</span>
            <span
              style={{
                fontFamily: theme.fonts.body,
                fontSize: 10,
                color: tab.active ? theme.colors.brand : theme.colors.gray,
                fontWeight: tab.active ? 700 : 500,
              }}
            >
              {tab.label}
            </span>
          </div>
        ))}
      </nav>
    </main>
  );
}
