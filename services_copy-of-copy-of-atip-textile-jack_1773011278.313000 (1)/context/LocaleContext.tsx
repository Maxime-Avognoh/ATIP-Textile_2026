import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from '../locales/translations';

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState('en'); // Default language: English

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
    }

    let translatedString = findTranslation(locale);

    if (translatedString === null) {
        translatedString = findTranslation('en'); // Fallback to English
    }

    if (translatedString === null) {
        return key; // Return the key if not found even in fallback
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
