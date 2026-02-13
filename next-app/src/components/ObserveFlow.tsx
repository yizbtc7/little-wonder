'use client';

import { useEffect, useMemo, useState } from 'react';
import LogoutButton from '@/components/LogoutButton';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/ui/FadeIn';
import WonderCard from '@/components/ui/WonderCard';
import { dailyInsights } from '@/data/daily-insights';
import { theme } from '@/styles/theme';

type InsightPayload = {
  title: string;
  revelation: string;
  brain_science_gem: string;
  activity: {
    main: string;
    express: string;
  };
  observe_next: string;
};

type DailyContentCard = {
  icon: string;
  title: string;
  domain: string;
  preview: string;
  full: {
    whats_happening: string;
    youll_see_it_when: string[];
    fascinating_part: string;
    how_to_be_present: string;
  };
};

type DailyContentPayload = {
  section_title: string;
  cards: DailyContentCard[];
};

type ObserveFlowProps = {
  parentName: string;
  childName: string;
  childAgeLabel: string;
  childBirthdate: string;
  initialDailyContent: unknown;
};

function getAgeMonths(birthdate: string): number {
  const now = new Date();
  const birth = new Date(birthdate);
  return (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
}

function parseInsightPayload(raw: string): InsightPayload {
  const fallback: InsightPayload = {
    title: 'Una maravilla en desarrollo',
    revelation: raw,
    brain_science_gem: 'Cada repetición fortalece conexiones neuronales que sostienen el aprendizaje profundo.',
    activity: {
      main: 'Repite el juego con un pequeño cambio de material y observa qué ajusta primero.',
      express: 'Versión express: nombra en voz alta lo que está probando y espera su siguiente intento.',
    },
    observe_next: 'La próxima vez, observa la pausa justo antes de actuar: ahí suele aparecer su hipótesis.',
  };

  const source = raw.match(/\{[\s\S]*\}/)?.[0] ?? raw;

  try {
    const parsed = JSON.parse(source) as Partial<InsightPayload>;
    return {
      title: parsed.title ?? fallback.title,
      revelation: parsed.revelation ?? fallback.revelation,
      brain_science_gem: parsed.brain_science_gem ?? fallback.brain_science_gem,
      activity: {
        main: parsed.activity?.main ?? fallback.activity.main,
        express: parsed.activity?.express ?? fallback.activity.express,
      },
      observe_next: parsed.observe_next ?? fallback.observe_next,
    };
  } catch {
    return fallback;
  }
}

function parseDailyContentPayload(raw: unknown, childName: string): DailyContentPayload | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const content = raw as Partial<DailyContentPayload>;
  if (!Array.isArray(content.cards)) {
    return null;
  }

  const cards = content.cards
    .filter((card): card is DailyContentCard => {
      if (!card || typeof card !== 'object') return false;
      const c = card as Partial<DailyContentCard>;
      return typeof c.title === 'string' && typeof c.icon === 'string' && typeof c.preview === 'string' && typeof c.domain === 'string' && !!c.full;
    })
    .slice(0, 3);

  if (cards.length === 0) {
    return null;
  }

  return {
    section_title:
      typeof content.section_title === 'string' && content.section_title.length > 0
        ? content.section_title
        : `¿Qué está pasando en el cerebro de ${childName}?`,
    cards,
  };
}

function renderWithChildBold(text: string, childName: string) {
  const safe = childName.trim();
  if (!safe) return text;
  const parts = text.split(new RegExp(`(${safe})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === safe.toLowerCase() ? <strong key={`${part}-${index}`}>{part}</strong> : <span key={`${part}-${index}`}>{part}</span>
  );
}

function rotateByDay<T>(items: T[]): T[] {
  if (items.length <= 1) return items;
  const dayIndex = new Date().getDate() % items.length;
  return [...items.slice(dayIndex), ...items.slice(0, dayIndex)];
}

function withChildName(text: string, childName: string): string {
  return text.replaceAll('{{child_name}}', childName);
}

function getDailyParentingInsight(childAgeMonths: number, childName: string) {
  const filteredInsights = dailyInsights.filter(
    (insight) => childAgeMonths >= insight.ageRangeMin && childAgeMonths <= insight.ageRangeMax
  );

  if (filteredInsights.length === 0) {
    return {
      text: `Today, follow ${childName}'s lead for 10 focused minutes. Describe what you see, pause, and let ${childName} take the next step.`,
      source: '📚 Responsive caregiving — early development foundations',
    };
  }

  const index = new Date().getDate() % filteredInsights.length;
  const selected = filteredInsights[index];

  return {
    text: withChildName(selected.text, childName),
    source: selected.source,
  };
}

function getStageContent(ageMonths: number, childName: string) {
  const name = childName || 'your baby';

  if (ageMonths <= 4) {
    return {
      stage: 'Early Explorer',
      observePrompts: [`What catches ${name}'s attention most?`, `How does ${name} react to different sounds?`, `What makes ${name} most calm or alert?`],
    };
  }

  if (ageMonths <= 8) {
    return {
      stage: 'Sensory Scientist',
      observePrompts: [`What does ${name} keep reaching for?`, `What makes ${name} laugh right now?`, `How is ${name} moving differently this week?`],
    };
  }

  if (ageMonths <= 14) {
    return {
      stage: 'Little Physicist',
      observePrompts: [`What does ${name} do over and over again?`, `What new thing did ${name} figure out recently?`, `What frustrates ${name} right now?`],
    };
  }

  return {
    stage: 'World Builder',
    observePrompts: [`What is ${name} pretending or imagining lately?`, `What new words or phrases has ${name} picked up?`, `What does ${name} choose during free time?`],
  };
}

export default function ObserveFlow({ parentName, childName, childAgeLabel, childBirthdate, initialDailyContent }: ObserveFlowProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showInsightScreen, setShowInsightScreen] = useState(false);
  const [showDailyCardScreen, setShowDailyCardScreen] = useState(false);
  const [observation, setObservation] = useState('');
  const [rawInsightResponse, setRawInsightResponse] = useState('');
  const [currentInsight, setCurrentInsight] = useState<InsightPayload | null>(null);
  const [insightObservation, setInsightObservation] = useState<string | null>(null);
  const [selectedDailyCard, setSelectedDailyCard] = useState<DailyContentCard | null>(null);
  const initialParsedDailyContent = useMemo(
    () => parseDailyContentPayload(initialDailyContent, childName),
    [initialDailyContent, childName]
  );
  const [dailyContent, setDailyContent] = useState<DailyContentPayload | null>(initialParsedDailyContent);
  const [isLoadingDailyContent, setIsLoadingDailyContent] = useState(!initialParsedDailyContent);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ageMonths = getAgeMonths(childBirthdate);
  const baseStageContent = useMemo(() => getStageContent(ageMonths, childName), [ageMonths, childName]);
  const stageContent = useMemo(
    () => ({
      ...baseStageContent,
      observePrompts: rotateByDay(baseStageContent.observePrompts),
    }),
    [baseStageContent]
  );
  const parsedInsight = useMemo(() => currentInsight ?? parseInsightPayload(rawInsightResponse), [currentInsight, rawInsightResponse]);
  const dailyParentingInsight = useMemo(() => getDailyParentingInsight(ageMonths, childName), [ageMonths, childName]);

  useEffect(() => {
    if (dailyContent) return;

    const fetchDailyContent = async () => {
      setIsLoadingDailyContent(true);
      try {
        const response = await fetch('/api/daily-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          setIsLoadingDailyContent(false);
          return;
        }

        const payload = (await response.json()) as { content?: unknown };
        const parsed = parseDailyContentPayload(payload.content ?? null, childName);
        if (parsed) {
          setDailyContent(parsed);
        }
      } catch {
        // ignore and use fallback UI
      } finally {
        setIsLoadingDailyContent(false);
      }
    };

    void fetchDailyContent();
  }, [dailyContent, childName]);

  const generateInsight = async () => {
    if (!observation.trim()) {
      setStatus('Write an observation first.');
      return;
    }

    const submittedObservation = observation.trim();

    setIsLoading(true);
    setStatus('Generating wonder...');
    setRawInsightResponse('');
    setCurrentInsight(null);
    setInsightObservation(submittedObservation);

    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observation: submittedObservation }),
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
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setRawInsightResponse(accumulated);
      }

      setCurrentInsight(parseInsightPayload(accumulated));
      setStatus('Done ✨');
      setObservation('');
      setIsComposerOpen(false);
    } catch {
      setStatus('Request failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showDailyCardScreen && selectedDailyCard) {
    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream, padding: '24px 20px' }}>
        <Button variant="ghost" onClick={() => setShowDailyCardScreen(false)} style={{ marginBottom: 10 }}>
          ← Back to today
        </Button>

        <FadeIn delay={0}>
          <h2 style={{ fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.dark, lineHeight: 1.25, marginBottom: 8 }}>
            {selectedDailyCard.icon} {selectedDailyCard.title}
          </h2>
          <p style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.brand, marginBottom: 12, fontWeight: 700 }}>
            {selectedDailyCard.domain}
          </p>
        </FadeIn>

        <FadeIn delay={120}>
          <section style={{ background: theme.colors.white, borderRadius: theme.radius.card, padding: 22, boxShadow: theme.shadows.elevated, borderLeft: `4px solid ${theme.colors.brand}`, marginBottom: 12 }}>
            <p style={{ color: theme.colors.brand, textTransform: 'uppercase', fontSize: 12, fontFamily: theme.fonts.body, fontWeight: 700, marginBottom: 8 }}>💡 What&apos;s happening</p>
            <article style={{ color: theme.colors.dark, lineHeight: 1.7, fontSize: 15, fontFamily: theme.fonts.body }}>{renderWithChildBold(selectedDailyCard.full.whats_happening, childName)}</article>
          </section>
        </FadeIn>

        <FadeIn delay={260}>
          <section style={{ background: theme.colors.brandLight, borderRadius: theme.radius.card, padding: 18, boxShadow: theme.shadows.subtle, marginBottom: 12 }}>
            <p style={{ color: theme.colors.brandDark, fontWeight: 700, marginBottom: 6, fontFamily: theme.fonts.body }}>👀 You&apos;ll see it when...</p>
            <ul style={{ color: theme.colors.dark, lineHeight: 1.6, fontFamily: theme.fonts.body, paddingLeft: 18, margin: 0 }}>
              {selectedDailyCard.full.youll_see_it_when.map((item) => (
                <li key={item} style={{ marginBottom: 6 }}>{item}</li>
              ))}
            </ul>
          </section>
        </FadeIn>

        <FadeIn delay={400}>
          <section style={{ background: `linear-gradient(135deg, ${theme.colors.warm} 0%, #F7EDE0 100%)`, borderRadius: theme.radius.card, padding: 20, boxShadow: theme.shadows.subtle, marginBottom: 12 }}>
            <p style={{ color: theme.colors.warmDark, fontWeight: 700, marginBottom: 8, fontFamily: theme.fonts.body }}>🧠 The fascinating part</p>
            <p style={{ color: theme.colors.dark, lineHeight: 1.6, fontFamily: theme.fonts.body }}>{selectedDailyCard.full.fascinating_part}</p>
          </section>
        </FadeIn>

        <FadeIn delay={540}>
          <section style={{ background: theme.colors.sageLight, borderRadius: theme.radius.card, padding: 18, boxShadow: theme.shadows.subtle }}>
            <p style={{ color: theme.colors.sage, fontWeight: 700, marginBottom: 6, fontFamily: theme.fonts.body }}>🌱 How to be present</p>
            <p style={{ color: theme.colors.dark, fontWeight: 500, fontSize: 16, lineHeight: 1.55, fontFamily: theme.fonts.body }}>{selectedDailyCard.full.how_to_be_present}</p>
          </section>
        </FadeIn>
      </main>
    );
  }

  if (showInsightScreen) {
    return (
      <main style={{ minHeight: '100vh', background: theme.colors.cream, padding: '24px 20px' }}>
        <Button variant="ghost" onClick={() => setShowInsightScreen(false)} style={{ marginBottom: 10 }}>
          ← Back to today
        </Button>

        {insightObservation ? (
          <FadeIn delay={0}>
            <section style={{ background: theme.colors.grayBg, borderRadius: theme.radius.card, padding: 16, marginBottom: 12 }}>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.grayLight, marginBottom: 6 }}>✏️ Tu observación:</p>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontStyle: 'italic', color: theme.colors.dark, lineHeight: 1.6 }}>{insightObservation}</p>
            </section>
          </FadeIn>
        ) : null}

        <FadeIn delay={120}>
          <h2 style={{ fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.dark, lineHeight: 1.25, marginBottom: 14 }}>{parsedInsight.title}</h2>
        </FadeIn>

        <FadeIn delay={250}>
          <section style={{ background: theme.colors.white, borderRadius: theme.radius.card, padding: 22, boxShadow: theme.shadows.elevated, borderLeft: `4px solid ${theme.colors.brand}`, marginBottom: 12 }}>
            <p style={{ color: theme.colors.brand, textTransform: 'uppercase', fontSize: 12, fontFamily: theme.fonts.body, fontWeight: 700, marginBottom: 8 }}>💡 Lo que está pasando</p>
            <article style={{ color: theme.colors.dark, lineHeight: 1.7, fontSize: 15, fontFamily: theme.fonts.body }}>{renderWithChildBold(parsedInsight.revelation, childName)}</article>
          </section>
        </FadeIn>

        <FadeIn delay={450}>
          <section style={{ background: theme.colors.brandLight, borderRadius: theme.radius.card, padding: 18, boxShadow: theme.shadows.subtle, marginBottom: 12 }}>
            <p style={{ color: theme.colors.brandDark, fontWeight: 700, marginBottom: 6, fontFamily: theme.fonts.body }}>🧠 Dato fascinante</p>
            <p style={{ color: theme.colors.dark, fontWeight: 500, lineHeight: 1.6, fontFamily: theme.fonts.body }}>{parsedInsight.brain_science_gem}</p>
          </section>
        </FadeIn>

        <FadeIn delay={600}>
          <section style={{ background: `linear-gradient(135deg, ${theme.colors.warm} 0%, #F7EDE0 100%)`, borderRadius: theme.radius.card, padding: 20, boxShadow: theme.shadows.subtle, marginBottom: 12 }}>
            <p style={{ color: theme.colors.warmDark, fontWeight: 700, marginBottom: 8, fontFamily: theme.fonts.body }}>🌱 Prueba esto</p>
            <p style={{ color: theme.colors.dark, lineHeight: 1.6, fontFamily: theme.fonts.body, marginBottom: 10 }}>{parsedInsight.activity.main}</p>
            <div style={{ background: theme.colors.white, borderRadius: 12, padding: 12 }}>
              <p style={{ fontWeight: 700, marginBottom: 4, fontFamily: theme.fonts.body }}>⚡ Versión express</p>
              <p style={{ lineHeight: 1.55, fontFamily: theme.fonts.body }}>{parsedInsight.activity.express}</p>
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={900}>
          <section style={{ background: theme.colors.sageLight, borderRadius: theme.radius.card, padding: 18, boxShadow: theme.shadows.subtle }}>
            <p style={{ color: theme.colors.sage, fontWeight: 700, marginBottom: 6, fontFamily: theme.fonts.body }}>👀 Para la próxima vez</p>
            <p style={{ color: theme.colors.dark, fontWeight: 700, fontSize: 17, lineHeight: 1.5, fontFamily: theme.fonts.body }}>{parsedInsight.observe_next}</p>
          </section>
        </FadeIn>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: theme.colors.cream, paddingBottom: 96 }}>
      <header style={{ background: `linear-gradient(135deg, ${theme.colors.brand} 0%, ${theme.colors.brandDark} 100%)`, padding: '32px 24px 28px', borderRadius: '0 0 28px 28px' }}>
        <FadeIn delay={80}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Good morning, {parentName} 👋</p>
              <h1 style={{ color: theme.colors.white, fontSize: 42, lineHeight: 1.1 }}>{childName}&apos;s World Today</h1>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{childAgeLabel} · {stageContent.stage}</p>
            </div>
            <LogoutButton />
          </div>
        </FadeIn>
      </header>

      <section style={{ padding: '20px 20px 0' }}>
        <FadeIn delay={150}>
          <button
            onClick={() => setIsComposerOpen(true)}
            style={{ width: '100%', textAlign: 'left', background: theme.colors.white, borderRadius: theme.radius.card, padding: '16px 18px', marginBottom: 14, boxShadow: theme.shadows.subtle, border: `1.5px dashed ${theme.colors.grayBg}`, cursor: 'pointer' }}
          >
            <p style={{ fontFamily: theme.fonts.body, fontSize: 15, color: theme.colors.dark, fontWeight: 600 }}>What&apos;s {childName} up to?</p>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.grayLight, marginTop: 2 }}>Log a moment of wonder</p>
          </button>
        </FadeIn>

        {isComposerOpen ? (
          <FadeIn>
            <div style={{ background: theme.colors.white, borderRadius: theme.radius.card, padding: 20, marginBottom: 16, boxShadow: theme.shadows.elevated, border: `1.5px solid ${theme.colors.brandLight}` }}>
              <textarea autoFocus value={observation} onChange={(event) => setObservation(event.target.value)} placeholder={stageContent.observePrompts[0]} style={{ width: '100%', height: 90, border: 'none', outline: 'none', resize: 'none', fontFamily: theme.fonts.body, fontSize: 16, color: theme.colors.dark }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <Button variant="ghost" onClick={() => setIsComposerOpen(false)}>Cancel</Button>
                <Button onClick={generateInsight} disabled={isLoading || !observation.trim()}>See the wonder ✨</Button>
              </div>
              {status ? <p style={{ marginTop: 8, color: theme.colors.gray, fontSize: 14 }}>{status}</p> : null}
            </div>
          </FadeIn>
        ) : null}

        <FadeIn delay={220}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 30, color: theme.colors.dark }}>
                {dailyContent?.section_title ?? `¿Qué está pasando en el cerebro de ${childName}?`}
              </h2>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.grayLight }}>Contenido educativo diario basado en su etapa actual</p>
            </div>
            <span style={{ fontSize: 12, color: theme.colors.brand, background: theme.colors.brandLight, padding: '4px 12px', borderRadius: theme.radius.chip, fontFamily: theme.fonts.body, fontWeight: 600 }}>{stageContent.stage}</span>
          </div>
        </FadeIn>

        {isLoadingDailyContent ? (
          <FadeIn delay={300}>
            <div style={{ background: theme.colors.white, borderRadius: theme.radius.card, padding: 18, boxShadow: theme.shadows.subtle, marginBottom: 12 }}>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.gray }}>Preparando contenido de hoy…</p>
            </div>
          </FadeIn>
        ) : null}

        {(dailyContent?.cards ?? []).map((card, index) => (
          <WonderCard
            key={`${card.title}-${index}`}
            icon={card.icon}
            title={card.title}
            body={card.preview}
            domain={card.domain}
            delay={300 + index * 90}
            onClick={() => {
              setSelectedDailyCard(card);
              setShowDailyCardScreen(true);
            }}
          />
        ))}

        <FadeIn delay={650}>
          <div style={{ background: `linear-gradient(135deg, ${theme.colors.warm} 0%, #F7EDE0 100%)`, borderRadius: theme.radius.card, padding: 20, marginTop: 8, marginBottom: 14 }}>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 13, fontWeight: 700, color: theme.colors.warmDark, marginBottom: 8 }}>TODAY'S PARENTING INSIGHT</p>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.dark, lineHeight: 1.6 }}>{dailyParentingInsight.text}</p>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.grayLight, marginTop: 8 }}>{dailyParentingInsight.source}</p>
          </div>
        </FadeIn>

        <FadeIn delay={720}>
          <p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 700, color: theme.colors.dark, marginBottom: 10 }}>Things to notice today</p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {stageContent.observePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setIsComposerOpen(true);
                  setObservation('');
                }}
                style={{ background: theme.colors.white, borderRadius: 14, padding: '14px 16px', minWidth: 220, boxShadow: theme.shadows.subtle, border: `1px solid ${theme.colors.grayBg}`, cursor: 'pointer', textAlign: 'left' }}
              >
                <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.dark, lineHeight: 1.4 }}>{prompt}</p>
                <p style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.brand, marginTop: 6, fontWeight: 600 }}>Tap to observe →</p>
              </button>
            ))}
          </div>
        </FadeIn>
      </section>

      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: theme.colors.white, borderTop: `1px solid ${theme.colors.grayBg}`, display: 'flex', justifyContent: 'space-around', padding: '10px 0 24px' }}>
        {[
          { icon: '🏠', label: 'Today', active: true },
          { icon: '📋', label: 'Timeline', active: false },
          { icon: '🧒', label: childName, active: false },
          { icon: '⚙️', label: 'Settings', active: false },
        ].map((tab) => (
          <div key={tab.label} style={{ textAlign: 'center', opacity: tab.active ? 1 : 0.45 }}>
            <span style={{ fontSize: 20, display: 'block' }}>{tab.icon}</span>
            <span style={{ fontFamily: theme.fonts.body, fontSize: 10, color: tab.active ? theme.colors.brand : theme.colors.gray, fontWeight: tab.active ? 700 : 500 }}>{tab.label}</span>
          </div>
        ))}
      </nav>
    </main>
  );
}
