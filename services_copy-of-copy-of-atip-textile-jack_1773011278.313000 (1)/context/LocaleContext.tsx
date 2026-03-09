import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations } from '../locales/translations';

const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'it', 'de', 'pt', 'nl'];
const STORAGE_KEY = 'atip-locale';

function detectInitialLocale(): string {
  // 1. Use saved preference if it exists
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;

  // 2. Detect from browser language (navigator.language = 'fr-FR', 'en-US', 'es-ES'...)
  const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
  if (SUPPORTED_LOCALES.includes(browserLang)) return browserLang;

  // 3. Check all declared browser languages as fallback
  for (const lang of navigator.languages || []) {
    const code = lang.split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(code)) return code;
  }

  return 'en';
}

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(() => detectInitialLocale());

  const setLocale = (newLocale: string) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    localStorage.setItem(STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
  };

  const t = (key: string, replacements?: { [key: string]: string }): string => {
    const keys = key.split('.');

    const findTranslation = (lang: string) => {
      let result: any = translations[lang];
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          return null;
        }
      }
      return result;
    };

    let translatedString = findTranslation(locale);

    if (translatedString === null) {
      translatedString = findTranslation('en');
    }

    if (translatedString === null) {
      return key;
    }

    let finalString = translatedString as string;

    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        finalString = finalString.replace(`{${rKey}}`, replacements[rKey]);
      });
    }

    return finalString;
  };

  const value = { locale, setLocale, t };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
