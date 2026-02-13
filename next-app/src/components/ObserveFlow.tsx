'use client';

import { useState } from 'react';

type Props = { userId: string; childId: string; childName: string };

export default function ObserveFlow({ childId, childName }: Props) {
  const [observation, setObservation] = useState('');
  const [insight, setInsight] = useState('');
  const [status, setStatus] = useState('');

  const generateInsight = async () => {
    if (!observation.trim()) {
      setStatus('Write an observation first.');
      return;
    }

    setStatus('Generating insight…');
    setInsight('');

    try {
      const res = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, observation }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || 'Failed to generate insight');
        return;
      }

      setInsight(data.insightText || JSON.stringify(data, null, 2));
      setStatus('Done');
    } catch {
      setStatus('Request failed');
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Today with {childName}</h1>
      <p>Log an observation to generate a personalized insight.</p>

      <textarea
        value={observation}
        onChange={(e) => setObservation(e.target.value)}
        placeholder="Hoy Leo tiró la cuchara muchas veces desde la silla..."
        style={{ width: '100%', minHeight: 120, padding: 12, marginBottom: 10 }}
      />

      <button onClick={generateInsight} style={{ padding: '10px 14px' }}>
        Generate insight
      </button>

      {status ? <p style={{ marginTop: 10 }}>{status}</p> : null}

      {insight ? (
        <section style={{ marginTop: 20, whiteSpace: 'pre-wrap', border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
          {insight}
        </section>
      ) : null}
    </main>
  );
}
