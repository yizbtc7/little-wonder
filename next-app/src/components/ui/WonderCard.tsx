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
};

export default function WonderCard({ icon, title, body, domain, delay = 0 }: WonderCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <FadeIn delay={delay}>
      <article
        onClick={() => setExpanded((value) => !value)}
        style={{
          background: theme.colors.white,
          borderRadius: theme.radius.card,
          padding: 20,
          marginBottom: 12,
          cursor: 'pointer',
          boxShadow: theme.shadows.subtle,
          border: `1px solid ${expanded ? theme.colors.brandLight : '#F0F0F0'}`,
          transition: 'all 0.2s ease',
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
                  color: theme.colors.brand,
                  background: theme.colors.brandLight,
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
                maxHeight: expanded ? 320 : 44,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}
            >
              {body}
            </p>
            {!expanded ? (
              <span style={{ fontSize: 13, color: theme.colors.brand, fontFamily: theme.fonts.body, fontWeight: 500 }}>
                Tap to read more
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </FadeIn>
  );
}
