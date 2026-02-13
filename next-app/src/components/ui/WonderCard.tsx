'use client';

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
  return (
    <FadeIn delay={delay}>
      <article
        onClick={onClick}
        style={{
          background: theme.colors.white,
          borderRadius: theme.radius.card,
          padding: 20,
          marginBottom: 12,
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: theme.shadows.subtle,
          border: `1px solid #F0F0F0`,
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
              }}
            >
              {toPreview(body)}
            </p>
            <span style={{ fontSize: 13, color: theme.colors.brand, fontFamily: theme.fonts.body, fontWeight: 500 }}>Tap to read more</span>
          </div>
        </div>
      </article>
    </FadeIn>
  );
}
