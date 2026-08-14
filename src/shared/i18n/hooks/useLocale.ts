import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { LANGUAGE_DIRECTIONS } from '../config';
import type { SupportedLanguage } from '../config';

export function useLocale() {
  const { i18n, t } = useTranslation();

  const language = i18n.language as SupportedLanguage;
  const direction = LANGUAGE_DIRECTIONS[language] ?? 'ltr';
  const isRTL = direction === 'rtl';

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = LANGUAGE_DIRECTIONS[lang];
    },
    [i18n],
  );

  return { language, direction, isRTL, setLanguage, t };
}
