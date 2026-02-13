export const theme = {
  colors: {
    brand: '#E3B938',
    brandLight: '#FFF6DA',
    brandDark: '#B68E1E',
    coral: '#E88D8D',
    coralLight: '#FFF1F1',
    sage: '#7FA39A',
    sageLight: '#EEF5F2',
    warm: '#F8EDE8',
    warmDark: '#B78478',
    dark: '#222126',
    gray: '#706C78',
    grayLight: '#A5A0AD',
    grayBg: '#F3EDF3',
    white: '#FFFFFF',
    cream: '#FAF4FA',
  },
  fonts: {
    display: "'DM Serif Display', Georgia, serif",
    body: "'DM Sans', -apple-system, sans-serif",
  },
  radius: {
    card: 20,
    button: 14,
    buttonLg: 18,
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
