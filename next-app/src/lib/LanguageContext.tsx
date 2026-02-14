'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, translations, type Language } from '@/lib/translations';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  dictionary: (typeof translations)[Language];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLanguage = DEFAULT_LANGUAGE }: { children: React.ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', next);
      localStorage.setItem('locale', next);
    }
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, dictionary: translations[language] }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
