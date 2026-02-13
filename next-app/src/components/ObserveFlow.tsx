'use client';

import { useState } from 'react';

type ObserveFlowProps = {
  childName: string;
};

export default function ObserveFlow({ childName }: ObserveFlowProps) {
  const [observation, setObservation] = useState('');
  const [insight, setInsight] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateInsight = async () => {
    if (!observation.trim()) {
      setStatus('Escribe primero una observación.');
      return;
    }

    setIsLoading(true);
    setStatus('Generando maravilla...');
    setInsight('');

    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observation: observation.trim() }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as { error?: string };
        setStatus(errorPayload.error ?? 'No pudimos generar el insight.');
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        setStatus('No recibimos respuesta del servidor.');
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

      setStatus('Listo.');
    } catch {
      setStatus('Falló la solicitud. Intenta otra vez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={{ marginTop: 16 }}>
      <p style={{ marginBottom: 10 }}>
        ¿Qué viste hoy en <strong>{childName}</strong>?
      </p>

      <textarea
        value={observation}
        onChange={(event) => setObservation(event.target.value)}
        placeholder="Ejemplo: hoy se quedó 10 minutos pasando agua entre dos vasos y sonriendo cuando se derramaba un poco..."
        style={{ width: '100%', minHeight: 120, padding: 12, marginBottom: 12 }}
      />

      <button disabled={isLoading} onClick={generateInsight} style={{ padding: '10px 14px' }}>
        Ver la maravilla ✨
      </button>

      {status ? <p style={{ marginTop: 10 }}>{status}</p> : null}

      {insight ? (
        <article
          style={{
            marginTop: 20,
            whiteSpace: 'pre-wrap',
            border: '1px solid #2c2c2c',
            borderRadius: 8,
            padding: 12,
          }}
        >
          {insight}
        </article>
      ) : null}
    </section>
  );
}
