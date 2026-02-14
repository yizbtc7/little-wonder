import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { theme } from '@/styles/theme';
import { useScrollProgress } from './useScrollProgress';

export type ArticleSection =
  | { type: 'body'; text: string }
  | { type: 'pull_quote'; text: string; emoji?: string }
  | { type: 'section_header'; text: string }
  | { type: 'science_callout'; title?: string; text: string }
  | { type: 'divider' }
  | { type: 'numbered_insight'; number?: number; title: string; text: string }
  | { type: 'try_this'; text: string }
  | { type: 'warm_tip'; text: string; emoji?: string };

type ExploreArticle = {
  id: string;
  title: string;
  emoji: string;
  type: 'article' | 'research' | 'guide';
  body: string;
  domain: string | null;
  read_time_minutes?: number;
};

type Props = {
  article: ExploreArticle;
  childName: string;
  childAgeLabel: string;
  locale: 'es' | 'en';
  onBack: () => void;
  onRegisterMoment: () => void;
};

function replacePlaceholders(text: string, childName: string, childAge: string) {
  return text
    .replaceAll('{childName}', childName)
    .replaceAll('{childAge}', childAge)
    .replaceAll('Leo', childName);
}

function FadeIn({ children, delay = 0, style = {} as React.CSSProperties }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.6s ease', ...style }}>
      {children}
    </div>
  );
}

function TypeBadge({ type, locale }: { type: ExploreArticle['type']; locale: 'es' | 'en' }) {
  const translated =
    locale === 'es'
      ? type === 'research'
        ? 'Investigación'
        : type === 'guide'
          ? 'Guía práctica'
          : 'Artículo'
      : type === 'research'
        ? 'Research'
        : type === 'guide'
          ? 'Practical Guide'
          : 'Article';

  const config = {
    Investigación: { color: theme.colors.lavenderDark, bg: theme.colors.lavenderLight },
    Artículo: { color: theme.colors.roseDark, bg: theme.colors.roseLight },
    'Guía práctica': { color: theme.colors.sageDark, bg: theme.colors.sageLight },
  } as const;

  const c = config[translated as keyof typeof config] ?? config.Artículo;

  return <span style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: c.color, background: c.bg, padding: '4px 12px', borderRadius: 20 }}>{translated}</span>;
}

function DomainBadge({ domain }: { domain: string }) {
  return <span style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: 600, color: theme.colors.textSec, background: theme.colors.white, border: `1px solid ${theme.colors.border}`, padding: '4px 12px', borderRadius: 20 }}>{domain}</span>;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: theme.fonts.display, fontSize: 22, fontWeight: 600, color: theme.colors.text, margin: '36px 0 16px', lineHeight: 1.3, letterSpacing: -0.3 }}>{children}</h2>;
}
function BodyText({ html }: { html: string }) {
  return <p style={{ fontFamily: theme.fonts.body, fontSize: 16, fontWeight: 400, color: theme.colors.textBody, lineHeight: 1.75, margin: '0 0 18px', letterSpacing: 0.1 }} dangerouslySetInnerHTML={{ __html: html }} />;
}
function PullQuote({ children, emoji = '💡' }: { children: React.ReactNode; emoji?: string }) {
  return <div style={{ margin: '28px 0', padding: '24px 24px 24px 20px', borderLeft: `4px solid ${theme.colors.rose}`, background: `linear-gradient(135deg, ${theme.colors.rosePale} 0%, #FFFAF8 100%)`, borderRadius: '0 16px 16px 0', position: 'relative' }}><span style={{ position: 'absolute', top: -12, left: 12, fontSize: 24, background: theme.colors.bg, padding: '0 4px' }}>{emoji}</span><p style={{ fontFamily: theme.fonts.display, fontSize: 17, fontWeight: 500, fontStyle: 'italic', color: theme.colors.text, margin: 0, lineHeight: 1.55 }}>{children}</p></div>;
}
function ScienceCallout({ title, text }: { title?: string; text: string }) {
  return <div style={{ margin: '28px 0', background: `linear-gradient(135deg, ${theme.colors.lavenderLight} 0%, #F8F2FC 100%)`, borderRadius: 18, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}><div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(196,181,212,0.12)' }} /><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span style={{ fontSize: 16 }}>🔬</span><span style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: theme.colors.lavenderDark }}>{title || 'La ciencia dice'}</span></div><p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 500, color: theme.colors.text, margin: 0, lineHeight: 1.6 }}>{text}</p></div>;
}
function TryThisBox({ children }: { children: React.ReactNode }) {
  return <div style={{ margin: '28px 0', background: `linear-gradient(135deg, ${theme.colors.sagePale} 0%, #F0F8EE 100%)`, borderRadius: 18, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}><div style={{ position: 'absolute', bottom: -10, right: -10, width: 50, height: 50, borderRadius: '50%', background: 'rgba(143,174,139,0.1)' }} /><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span style={{ fontSize: 16 }}>🌱</span><span style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: theme.colors.sageDark }}>Qué puedes hacer</span></div><div style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 400, color: theme.colors.text, lineHeight: 1.65 }}>{children}</div></div>;
}
function WarmTip({ text, emoji = '🤲' }: { text: string; emoji?: string }) {
  return <div style={{ margin: '28px 0', background: `linear-gradient(135deg, ${theme.colors.goldLight} 0%, #FFF6E8 100%)`, borderRadius: 18, padding: '20px 22px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span style={{ fontSize: 16 }}>{emoji}</span><span style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: theme.colors.gold }}>Para recordar</span></div><p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 500, color: theme.colors.text, margin: 0, lineHeight: 1.6 }}>{text}</p></div>;
}
function NumberedInsight({ number, title, text }: { number: number; title: string; text: string }) {
  return <div style={{ display: 'flex', gap: 14, margin: '18px 0', alignItems: 'flex-start' }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.colors.rose} 0%, ${theme.colors.roseDark} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><span style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 800, color: theme.colors.white }}>{number}</span></div><div><p style={{ fontFamily: theme.fonts.body, fontSize: 15, fontWeight: 700, color: theme.colors.text, margin: '0 0 4px' }}>{title}</p><p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 400, color: theme.colors.textBody, margin: 0, lineHeight: 1.6 }}>{text}</p></div></div>;
}
function Divider() {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '32px 0', gap: 12 }}><div style={{ height: 1, flex: 1, background: theme.colors.border }} /><span style={{ fontSize: 10, color: theme.colors.textTer }}>✦</span><div style={{ height: 1, flex: 1, background: theme.colors.border }} /></div>;
}

function htmlSafe(text: string) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function parseMarkdownToSections(body: string): ArticleSection[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const sections: ArticleSection[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim();
    if (text) sections.push({ type: 'body', text });
    paragraph = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (line === '---') {
      flushParagraph();
      sections.push({ type: 'divider' });
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      sections.push({ type: 'section_header', text: line.slice(3).trim() });
      continue;
    }

    const numbered = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s+[—-]\s+(.+)$/);
    if (numbered) {
      flushParagraph();
      sections.push({ type: 'numbered_insight', number: Number(numbered[1]), title: numbered[2].trim(), text: numbered[3].trim() });
      continue;
    }

    if (line.startsWith('>')) {
      flushParagraph();
      const quote = line.replace(/^>\s?/, '').trim();

      if (quote.startsWith('💡')) {
        sections.push({ type: 'pull_quote', emoji: '💡', text: quote.replace(/^💡\s*/, '') });
        continue;
      }

      if (quote.startsWith('🔬')) {
        const science = quote.replace(/^🔬\s*/, '');
        const m = science.match(/^\*\*(.+?)\*\*\s*(.*)$/);
        sections.push({ type: 'science_callout', title: m?.[1]?.trim() || undefined, text: m?.[2]?.trim() || science });
        continue;
      }

      if (quote.startsWith('🌱')) {
        sections.push({ type: 'try_this', text: quote.replace(/^🌱\s*/, '') });
        continue;
      }

      if (quote.startsWith('💛') || quote.startsWith('🤲')) {
        const emoji = quote.startsWith('💛') ? '💛' : '🤲';
        sections.push({ type: 'warm_tip', emoji, text: quote.replace(/^(💛|🤲)\s*/, '') });
        continue;
      }

      paragraph.push(quote);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return sections;
}

export default function ArticleReader({ article, childName, childAgeLabel, locale, onBack, onRegisterMoment }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(scrollRef);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [article.id]);

  const content = useMemo(() => {
    const base = parseMarkdownToSections(article.body);
    return base.map((section) => {
      const next = { ...section } as ArticleSection;
      if ('text' in next && typeof next.text === 'string') next.text = replacePlaceholders(next.text, childName, childAgeLabel);
      if ('title' in next && typeof next.title === 'string') next.title = replacePlaceholders(next.title, childName, childAgeLabel);
      return next;
    });
  }, [article.body, childAgeLabel, childName]);

  const title = replacePlaceholders(article.title, childName, childAgeLabel);
  const sources = 'Erikson (Autonomía vs. Vergüenza) · Gerber/RIE · Harvard CCHD · Diamond';

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', height: '100vh', background: theme.colors.bg, fontFamily: theme.fonts.body, position: 'relative', boxShadow: '0 0 40px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, background: theme.colors.bg, zIndex: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: theme.colors.white, border: `1px solid ${theme.colors.border}`, borderRadius: 24, padding: '7px 16px', fontFamily: theme.fonts.body, fontSize: 13, fontWeight: 600, color: theme.colors.textSec, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>← {locale === 'es' ? 'Volver' : 'Back'}</button>
        <div style={{ display: 'flex', gap: 8 }}><button style={{ background: 'none', border: 'none', fontSize: 18, padding: 4 }}>🔖</button><button style={{ background: 'none', border: 'none', fontSize: 18, padding: 4 }}>↗️</button></div>
      </div>
      <div style={{ height: 3, background: theme.colors.border, flexShrink: 0 }}><div style={{ height: 3, background: `linear-gradient(90deg, ${theme.colors.rose}, ${theme.colors.roseDark})`, width: `${progress * 100}%`, borderRadius: '0 2px 2px 0', transition: 'width 0.1s ease' }} /></div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}><div style={{ padding: '24px 24px 60px' }}>
        <FadeIn delay={100}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}><span style={{ fontSize: 28 }}>{article.emoji}</span><TypeBadge type={article.type} locale={locale} />{article.domain ? <DomainBadge domain={article.domain} /> : null}<span style={{ fontFamily: theme.fonts.body, fontSize: 11, color: theme.colors.textTer, fontWeight: 600 }}>☕ {article.read_time_minutes ?? 5} min</span></div></FadeIn>
        <FadeIn delay={200}><h1 style={{ fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700, color: theme.colors.text, lineHeight: 1.2, margin: '0 0 20px', letterSpacing: -0.5 }}>{title}</h1></FadeIn>
        <FadeIn delay={300}><div style={{ background: `linear-gradient(135deg, ${theme.colors.blush} 0%, #FFF2EC 100%)`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.colors.rose} 40%, ${theme.colors.lavender} 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{childName.charAt(0).toUpperCase()}</div><p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textBody, margin: 0, lineHeight: 1.45 }}>Para <strong>{childName}</strong> ({childAgeLabel}), esto es especialmente relevante ahora. Úsalo como lente para observar un momento concreto hoy.</p></div></FadeIn>
        <FadeIn delay={400}>
          {content.map((section, index) => {
            if (section.type === 'body') return <BodyText key={index} html={htmlSafe(section.text)} />;
            if (section.type === 'pull_quote') return <PullQuote key={index} emoji={section.emoji}>{section.text}</PullQuote>;
            if (section.type === 'section_header') return <SectionHeader key={index}>{section.text}</SectionHeader>;
            if (section.type === 'science_callout') return <ScienceCallout key={index} title={section.title} text={section.text} />;
            if (section.type === 'divider') return <Divider key={index} />;
            if (section.type === 'numbered_insight') return <NumberedInsight key={index} number={section.number ?? index + 1} title={section.title} text={section.text} />;
            if (section.type === 'try_this') return <TryThisBox key={index}><p style={{ margin: 0 }}>{section.text}</p></TryThisBox>;
            if (section.type === 'warm_tip') return <WarmTip key={index} emoji={section.emoji} text={section.text} />;
            return null;
          })}

          <div style={{ marginTop: 32, paddingTop: 16, borderTop: `1px solid ${theme.colors.border}` }}><p style={{ fontFamily: theme.fonts.body, fontSize: 11, fontWeight: 600, color: theme.colors.textTer, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{locale === 'es' ? 'Basado en investigación de' : 'Based on research from'}</p><p style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textTer, lineHeight: 1.5, margin: 0 }}>{sources}</p></div>
          <div style={{ marginTop: 28, background: theme.colors.white, borderRadius: 18, padding: '22px', border: `1px solid ${theme.colors.border}`, textAlign: 'center' }}><p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 600, color: theme.colors.text, margin: '0 0 4px' }}>{locale === 'es' ? '¿Algo de esto te resonó?' : 'Did this resonate?'}</p><p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textSec, margin: '0 0 16px' }}>{locale === 'es' ? `Registra un momento que observes hoy con ${childName}` : `Capture something you notice with ${childName} today`}</p><button onClick={onRegisterMoment} style={{ background: `linear-gradient(135deg, ${theme.colors.rose} 0%, ${theme.colors.roseDark} 100%)`, border: 'none', borderRadius: 14, padding: '14px 28px', fontFamily: theme.fonts.body, fontSize: 15, fontWeight: 700, color: theme.colors.white, cursor: 'pointer', boxShadow: `0 4px 14px ${theme.colors.rose}66` }}>✨ {locale === 'es' ? 'Registrar un momento' : 'Capture a moment'}</button></div>
        </FadeIn>
      </div></div>
    </div>
  );
}
