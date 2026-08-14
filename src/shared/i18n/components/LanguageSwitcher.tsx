import { useLocale } from '../hooks/useLocale';
import { cn } from '@/shared/lib/utils';
import type { SupportedLanguage } from '../config';

const LABELS: Record<SupportedLanguage, string> = {
  en: 'EN',
  ar: 'ع',
};

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLocale();

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-1',
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      {(['en', 'ar'] as SupportedLanguage[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          title={lang === 'en' ? 'English' : 'العربية'}
          aria-pressed={language === lang}
          className={cn(
            'flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors min-w-[28px]',
            language === lang
              ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
          )}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
