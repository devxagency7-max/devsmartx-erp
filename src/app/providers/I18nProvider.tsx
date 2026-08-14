import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { LANGUAGE_DIRECTIONS } from '@/shared/i18n/config';
import type { SupportedLanguage } from '@/shared/i18n/config';

interface Props {
  children: ReactNode;
}

export function I18nProvider({ children }: Props) {
  // Sync html[lang] and html[dir] whenever language changes
  useEffect(() => {
    function syncDocument(lang: string) {
      document.documentElement.lang = lang;
      document.documentElement.dir =
        LANGUAGE_DIRECTIONS[lang as SupportedLanguage] ?? 'ltr';
    }

    syncDocument(i18n.language);
    i18n.on('languageChanged', syncDocument);
    return () => {
      i18n.off('languageChanged', syncDocument);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
