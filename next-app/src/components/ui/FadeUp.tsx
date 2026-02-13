'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

type Props = { children: ReactNode; delay?: number; style?: CSSProperties };

export default function FadeUp({ children, delay = 0, style }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
