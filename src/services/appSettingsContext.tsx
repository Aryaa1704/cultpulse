import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, SUPPORTED_LANGUAGES, LanguageOption, getTranslation } from './i18n';

export type AppTheme = 'default' | 'dark';

interface AppSettingsContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  supportedLanguages: LanguageOption[];
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language State: Default is English ('en')
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('cultpulse_language') as LanguageCode | null;
    return saved && ['en', 'hi', 'es', 'fr', 'de'].includes(saved) ? saved : 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('cultpulse_language', lang);
  };

  const t = (key: string) => {
    return getTranslation(language, key);
  };

  // 2. Theme State: Default is 'default' (Light clean aesthetic)
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('cultpulse_theme') as AppTheme | null;
    return saved === 'dark' ? 'dark' : 'default';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('cultpulse_theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'default' : 'dark');
  };

  // Synchronize 'dark' class on <html> document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AppSettingsContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export function useAppSettings(): AppSettingsContextValue {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
