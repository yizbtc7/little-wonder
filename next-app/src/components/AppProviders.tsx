'use client';

import { LanguageProvider } from '@/lib/LanguageContext';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
