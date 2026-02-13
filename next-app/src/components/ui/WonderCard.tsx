'use client';

import { useState } from 'react';
import { theme } from '@/styles/theme';
import FadeIn from '@/components/ui/FadeIn';

type WonderCardProps = {
  icon: string;
  title: string;
  body: string;
  domain: string;
  delay?: number;
  onClick?: () => void;
};

function toPreview(text: string): string {
  return text.length > 180 ? `${text.slice(0, 180)}...` : text;
}

export default function WonderCard({ icon, title, body, domain, delay = 0, onClick }: WonderCardProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <FadeIn delay={delay}>
      <article
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          background: '#FFF9FD',
          borderRadius: theme.radius.card,
          padding: 22,
          marginBottom: 16,
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: hovered ? theme.shadows.elevated : theme.shadows.subtle,
          border: hovered ? `1px solid ${theme.colors.coral}` : `1px solid ${theme.colors.grayBg}`,
          transition: `all ${theme.motion.normal} ${theme.motion.spring}`,
          transform: pressed ? 'scale(0.985)' : hovered ? 'translateY(-2px)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div
            style={{
              fontSize: 28,
              width: 48,
              height: 48,
              borderRadius: 12,
              background: theme.colors.brandLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transform: hovered ? 'translateY(-1px) scale(1.06)' : 'none',
              transition: `transform ${theme.motion.fast} ${theme.motion.spring}`,
            }}
          >
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ fontFamily: theme.fonts.body, fontSize: 16, fontWeight: 600, color: theme.colors.dark, margin: 0 }}>{title}</h3>
              <span
                style={{
                  fontSize: 11,
                  color: theme.colors.warmDark,
                  background: theme.colors.warm,
                  padding: '3px 10px',
                  borderRadius: theme.radius.chip,
                  fontFamily: theme.fonts.body,
                  fontWeight: 500,
                }}
              >
                {domain}
              </span>
            </div>
            <p
              style={{
                fontFamily: theme.fonts.body,
                fontSize: 14,
                lineHeight: 1.6,
                color: theme.colors.gray,
                margin: '8px 0 0',
              }}
            >
              {toPreview(body)}
            </p>
            <span
              style={{
                fontSize: 13,
                color: theme.colors.brand,
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transform: hovered ? 'translateX(2px)' : 'none',
                transition: `transform ${theme.motion.fast} ${theme.motion.spring}`,
              }}
            >
              Tap to read more <span style={{ display: 'inline-block' }}>→</span>
            </span>
          </div>
        </div>
      </article>
    </FadeIn>
  );
}
