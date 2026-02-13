'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { theme } from '@/styles/theme';

type Variant = 'primary' | 'soft' | 'ghost' | 'chip';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  style?: CSSProperties;
  full?: boolean;
  disabled?: boolean;
};

export default function SoftButton({ children, onClick, variant = 'primary', style, full = false, disabled = false }: Props) {
  const [pressed, setPressed] = useState(false);

  const variants: Record<Variant, CSSProperties> = {
    primary: { background: theme.colors.charcoal, color: '#fff', padding: '16px 32px', fontSize: 16 },
    soft: { background: theme.colors.blush, color: theme.colors.darkText, padding: '14px 28px', fontSize: 15 },
    ghost: { background: 'transparent', color: theme.colors.midText, padding: '12px 20px', fontSize: 14 },
    chip: { background: theme.colors.blushLight, color: theme.colors.roseDark, padding: '8px 16px', fontSize: 13 },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      disabled={disabled}
      style={{
        border: 'none',
        borderRadius: 50,
        fontFamily: theme.fonts.sans,
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        width: full ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        letterSpacing: 0.2,
        opacity: disabled ? 0.5 : 1,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
