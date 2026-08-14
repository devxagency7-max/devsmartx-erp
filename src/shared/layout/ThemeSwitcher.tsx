import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeProvider';
import type { ThemeMode } from '@/core/theme/ThemeProvider';
import { cn } from '@/shared/lib/utils';

const options: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'system', icon: Monitor, label: 'System' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
];

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-1">
      {options.map(({ mode: m, icon: Icon, label }) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          title={label}
          className={cn(
            'flex items-center justify-center rounded-md p-1.5 transition-colors',
            mode === m
              ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
