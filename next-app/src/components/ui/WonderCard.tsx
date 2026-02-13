'use client';

import { useState } from 'react';
import FadeUp from '@/components/ui/FadeUp';
import { theme } from '@/styles/theme';

type WonderCardProps = {
  icon: string;
  title: string;
  body: string;
  domain: string;
  delay?: number;
  onClick?: () => void;
};

function toPreview(text: string): string {
  return text.length > 190 ? `${text.slice(0, 190)}...` : text;
}

export default function WonderCard({ icon, title, body, domain, delay = 0, onClick }: WonderCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <FadeUp delay={delay}>
      <article
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: theme.colors.white,
          borderRadius: theme.radius.lg,
          padding: 0,
          marginBottom: 14,
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-2px)' : 'none',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: theme.colors.blushLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: theme.fonts.serif,
                fontSize: 17,
                fontWeight: 600,
                color: theme.colors.darkText,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {title}
            </h3>

            <span
              style={{
                display: 'inline-block',
                marginTop: 6,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
                color: theme.colors.roseDark,
                background: theme.colors.blushLight,
                borderRadius: 20,
                padding: '3px 10px',
                fontFamily: theme.fonts.sans,
              }}
            >
              {domain}
            </span>

            <p
              style={{
                fontFamily: theme.fonts.sans,
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 1.55,
                color: theme.colors.midText,
                margin: '10px 0 0',
              }}
            >
              {toPreview(body)}
            </p>
          </div>
        </div>

        <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: theme.fonts.sans, fontSize: 13, fontWeight: 600, color: theme.colors.rose }}>Read more</span>
          <span style={{ fontSize: 12, color: theme.colors.rose }}>→</span>
        </div>
      </article>
    </FadeUp>
  );
}
