export const LOCALES = {
  'en-US': { code: 'en-US', name: 'English (US)', dir: 'ltr' },
  'ar-SA': { code: 'ar-SA', name: 'العربية', dir: 'rtl' },
} as const;

export type LocaleCode = keyof typeof LOCALES;
export type TextDirection = 'ltr' | 'rtl';
