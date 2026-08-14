import { APP_NAME, APP_VERSION } from '@/shared/constants/app';

export function Footer() {
  return (
    <footer className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/60 px-6 py-2.5">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        {APP_NAME} v{APP_VERSION}
      </p>
    </footer>
  );
}
