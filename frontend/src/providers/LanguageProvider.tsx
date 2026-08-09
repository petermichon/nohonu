import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import i18n from '../lib/i18n.ts';

type Language = 'en' | 'fr' | 'auto';

interface LanguageContextType {
  language: Language;
  resolvedLanguage: 'en' | 'fr';
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getBrowserLanguage(): 'en' | 'fr' {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('fr')) return 'fr';
  return 'en'; // Default to English
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved === 'en' || saved === 'fr' || saved === 'auto') return saved;
    return 'auto'; // Default to System
  });

  const resolvedLanguage: 'en' | 'fr' = language === 'auto' ? getBrowserLanguage() : language;

  useEffect(() => {
    i18n.changeLanguage(resolvedLanguage);
    localStorage.setItem('language', language);
    document.documentElement.lang = resolvedLanguage;
  }, [language, resolvedLanguage]);

  // Listen for browser language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      if (language === 'auto') {
        // Force re-render by triggering a state update
        setLanguage('auto');
      }
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, resolvedLanguage, setLanguage }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
