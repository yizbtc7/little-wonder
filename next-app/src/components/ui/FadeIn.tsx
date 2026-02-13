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
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.985)',
        transition: 'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
