'use client';

import { useMemo, useState } from 'react';
import LogoutButton from '@/components/LogoutButton';

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
  insights: InsightCard[];
};

function toPreview(text: string): string {
  return text.length > 150 ? `${text.slice(0, 150)}...` : text;
}

function formatTag(insight: InsightCard): string {
  if (insight.domain) {
    return insight.domain;
  }

  if (insight.schema_detected) {
    return insight.schema_detected;
  }

  return 'Little Physicist';
}

function EmptyCard({ childName }: { childName: string }) {
  return (
    <article
      style={{
        borderRadius: 18,
        border: '1px solid #EBE9F3',
        background: '#FFFFFF',
        padding: 18,
      }}
    >
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 34, marginBottom: 8 }}>The first wonder</h3>
      <p style={{ color: '#6D6A81', fontSize: 22, lineHeight: 1.35 }}>
        Write your first observation and we&apos;ll illuminate what&apos;s happening in {childName}&apos;s brain right now.
      </p>
    </article>
  );
}

export default function ObserveFlow({ parentName, childName, childAgeLabel, insights }: ObserveFlowProps) {
  const [observation, setObservation] = useState('');
  const [insight, setInsight] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const mergedInsights = useMemo(() => {
    if (!insight) {
      return insights;
    }

    return [
      {
        id: 'latest-stream',
        content: insight,
        created_at: new Date().toISOString(),
        schema_detected: null,
        domain: 'Just now',
      },
      ...insights,
    ];
  }, [insight, insights]);

  const generateInsight = async () => {
    if (!observation.trim()) {
      setStatus('Write an observation first.');
      return;
    }

    setIsLoading(true);
    setStatus('Generating wonder...');
    setInsight('');

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
      let accumulatedInsight = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedInsight += chunk;
        setInsight(accumulatedInsight);
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

  return (
    <main style={{ background: '#F9F8FC', minHeight: '100vh', color: '#27253A' }}>
      <header
        style={{
          background: 'linear-gradient(180deg, #6D53F6 0%, #4F41D9 100%)',
          color: '#F8F8FF',
          borderBottomLeftRadius: 34,
          borderBottomRightRadius: 34,
          padding: '24px 20px 30px',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <p style={{ opacity: 0.88, fontSize: 20, marginBottom: 8 }}>Good morning, {parentName} 👋</p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 52, lineHeight: 1.1 }}>{childName}&apos;s World Today</h1>
            <p style={{ opacity: 0.9, fontSize: 22, marginTop: 8 }}>{childAgeLabel} old · Little Physicist</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 34px' }}>
        <div style={{ marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: '#FFF',
              border: '1px solid #EBE9F3',
              borderRadius: 18,
              padding: 16,
              boxShadow: '0 6px 18px rgba(27,17,84,0.05)',
              cursor: 'pointer',
            }}
          >
            <p style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>What&apos;s {childName} up to?</p>
            <p style={{ color: '#7A768E', fontSize: 20 }}>Log a moment of wonder</p>
          </button>

          {isComposerOpen ? (
            <div
              style={{
                background: '#FFF',
                border: '1px solid #EBE9F3',
                borderRadius: 18,
                padding: 16,
                marginTop: 12,
              }}
            >
              <textarea
                value={observation}
                onChange={(event) => setObservation(event.target.value)}
                placeholder={`What does ${childName} do over and over again?`}
                style={{ width: '100%', minHeight: 120, borderRadius: 14, border: '1px solid #E5E2F0', padding: 12, fontSize: 20 }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setObservation('');
                    setIsComposerOpen(false);
                    setStatus('');
                  }}
                  style={{
                    border: '1px solid #E5E2F0',
                    background: '#FFF',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#5D5A70',
                    fontSize: 22,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={isLoading}
                  onClick={generateInsight}
                  style={{
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 18px',
                    background: '#AFA2F9',
                    color: '#FFF',
                    fontSize: 24,
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  See the wonder ✨
                </button>
              </div>
            </div>
          ) : null}

          {status ? <p style={{ marginTop: 10, color: '#625E79', fontSize: 19 }}>{status}</p> : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 46, lineHeight: 1.08 }}>Today&apos;s Wonders</h2>
            <p style={{ color: '#6E6A81', fontSize: 20, marginTop: 2 }}>What {childName}&apos;s brain is up to right now</p>
          </div>
          <span style={{ borderRadius: 999, background: '#EDE8FF', color: '#5B48CF', padding: '8px 14px', fontSize: 18, fontWeight: 700 }}>
            Little Physicist
          </span>
        </div>

        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          {mergedInsights.length === 0 ? <EmptyCard childName={childName} /> : null}

          {mergedInsights.map((item) => (
            <details
              key={item.id}
              style={{
                background: '#FFF',
                border: '1px solid #EBE9F3',
                borderRadius: 18,
                padding: 16,
                boxShadow: '0 4px 16px rgba(27,17,84,0.04)',
              }}
            >
              <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                <p style={{ fontWeight: 800, fontSize: 30, marginBottom: 6 }}>{item.domain ?? 'Moment of Wonder'}</p>
                <span
                  style={{
                    borderRadius: 999,
                    background: '#EFEAFF',
                    color: '#5F4AE6',
                    padding: '4px 10px',
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {formatTag(item)}
                </span>
                <p style={{ marginTop: 10, color: '#5E5B72', fontSize: 21, lineHeight: 1.36 }}>{toPreview(item.content)}</p>
                <p style={{ color: '#5F4AE6', fontSize: 18, marginTop: 8 }}>Tap to read more</p>
              </summary>
              <article style={{ whiteSpace: 'pre-wrap', marginTop: 12, color: '#2F2B45', lineHeight: 1.4, fontSize: 20 }}>
                {item.content}
              </article>
            </details>
          ))}
        </div>

        <nav
          style={{
            position: 'sticky',
            bottom: 12,
            borderRadius: 20,
            background: '#FFFFFF',
            border: '1px solid #ECE9F4',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            textAlign: 'center',
            padding: '10px 8px',
            fontSize: 16,
            color: '#9A97AD',
          }}
        >
          <div style={{ color: '#5F4AE6', fontWeight: 700 }}>🏠 Today</div>
          <div>🗓️ Timeline</div>
          <div>🧒 {childName}</div>
          <div>⚙️ Settings</div>
        </nav>
      </section>
    </main>
  );
}
