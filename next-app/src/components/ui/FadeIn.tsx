'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
};

export default function FadeIn({ children, delay = 0, style }: FadeInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
