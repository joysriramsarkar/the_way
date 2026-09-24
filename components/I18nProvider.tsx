'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UI_TRANSLATIONS } from '@/lib/translationsData';

export const SUPPORTED_LANGUAGES: Record<string, string> = {
  bn: 'বাংলা',
  en: 'English',
  es: 'Español',
  hi: 'हिन्दी',
  ar: 'العربية',
  pt: 'Português',
  fr: 'Français',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어'
};

interface I18nContextType {
  lang: string;
  setLang: (l: string) => void;
  t: (key: string, fallback?: string) => string;
  translations: Record<string, string>;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'bn',
  setLang: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  translations: UI_TRANSLATIONS['bn'] || {},
  isLoading: false
});

export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>('bn');
  const [translations, setTranslations] = useState<Record<string, string>>(UI_TRANSLATIONS['bn'] || {});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadTranslations = async (targetLang: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/locales/${targetLang}.json`);
      if (res.ok) {
        const data = await res.json();
        setTranslations((prev) => ({
          ...(UI_TRANSLATIONS[targetLang] || {}),
          ...data
        }));
      }
    } catch {
      // Fallback already active from UI_TRANSLATIONS
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('theway_lang') || 'bn';
    const active = SUPPORTED_LANGUAGES[saved] ? saved : 'bn';
    setLangState(active);
    setTranslations(UI_TRANSLATIONS[active] || UI_TRANSLATIONS['bn'] || {});
    document.documentElement.lang = active;
    document.documentElement.dir = active === 'ar' ? 'rtl' : 'ltr';
    loadTranslations(active);
  }, []);

  const setLang = (newLang: string) => {
    if (!SUPPORTED_LANGUAGES[newLang]) return;
    setLangState(newLang);
    // Instant synchronous UI update from bundled dictionary
    setTranslations(UI_TRANSLATIONS[newLang] || UI_TRANSLATIONS['en'] || {});
    localStorage.setItem('theway_lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    loadTranslations(newLang);
  };

  const t = (key: string, fallback?: string): string => {
    return (
      translations[key] ||
      UI_TRANSLATIONS[lang]?.[key] ||
      UI_TRANSLATIONS['en']?.[key] ||
      fallback ||
      key
    );
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, translations, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}
