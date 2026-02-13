'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { theme } from '@/styles/theme';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: CSSProperties;
};

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const baseStyle: CSSProperties = {
    border: 'none',
    borderRadius: size === 'lg' ? theme.radius.buttonLg : theme.radius.button,
    fontFamily: theme.fonts.body,
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    transition: `all ${theme.motion.normal} ${theme.motion.spring}`,
    opacity: disabled ? 0.55 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };

  const variantStyle: Record<Variant, CSSProperties> = {
    primary: {
      background: hovered ? theme.colors.brandDark : theme.colors.brand,
      color: theme.colors.white,
      padding: size === 'lg' ? '18px 32px' : '14px 24px',
      fontSize: size === 'lg' ? 18 : 16,
      transform: pressed ? 'translateY(0) scale(0.98)' : hovered ? 'translateY(-1px) scale(1.01)' : 'none',
      boxShadow: hovered ? theme.shadows.glow : `0 2px 8px ${theme.colors.brand}30`,
    },
    secondary: {
      background: theme.colors.white,
      color: theme.colors.dark,
      padding: size === 'lg' ? '18px 32px' : '14px 24px',
      fontSize: size === 'lg' ? 18 : 16,
      border: `1.5px solid ${theme.colors.grayBg}`,
    },
    ghost: {
      background: 'transparent',
      color: theme.colors.gray,
      padding: size === 'lg' ? '18px 24px' : '10px 16px',
      fontSize: size === 'lg' ? 17 : 15,
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{ ...baseStyle, ...variantStyle[variant], ...style }}
    >
      {children}
    </button>
  );
}
