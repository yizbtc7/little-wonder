'use client';

import { useState } from 'react';

export default function ObserveFlow({ userId }: { userId: string }) {
  const [prompt, setPrompt] = useState('');
  const [insight, setInsight] = useState('');

  const generateInsight = async () => {
    try {
      const res = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInsight(data.insight);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Home / Observe</h1>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter observation"
      />
      <button onClick={generateInsight}>Generate Insight</button>
      {insight && <p>{insight}</p>}
    </div>
  );
}