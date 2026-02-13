export const theme = {
  colors: {
    brand: '#E3B938',
    brandLight: '#FFF6DA',
    brandDark: '#B68E1E',
    coral: '#E8725A',
    coralLight: '#FFF0ED',
    sage: '#4AA87D',
    sageLight: '#E8F5EE',
    warm: '#F5E6D0',
    warmDark: '#D4A574',
    dark: '#2D2D3A',
    gray: '#6B7280',
    grayLight: '#9CA3AF',
    grayBg: '#F3F4F6',
    white: '#FFFFFF',
    cream: '#FDFBF7',
  },
  fonts: {
    display: "'DM Serif Display', Georgia, serif",
    body: "'DM Sans', -apple-system, sans-serif",
  },
  radius: {
    card: 16,
    button: 12,
    buttonLg: 16,
    chip: 24,
  },
  shadows: {
    subtle: '0 2px 10px rgba(45,45,58,0.08)',
    elevated: '0 10px 28px rgba(45,45,58,0.14)',
    glow: '0 10px 30px rgba(107,92,231,0.25)',
  },
  motion: {
    fast: '160ms',
    normal: '260ms',
    spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
} as const;
