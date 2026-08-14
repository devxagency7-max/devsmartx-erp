import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { ar } from './locales/ar';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_DIRECTIONS: Record<SupportedLanguage, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false, // React handles XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'devsmartx-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
