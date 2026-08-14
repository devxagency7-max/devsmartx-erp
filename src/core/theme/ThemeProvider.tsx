import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { storage } from '@/core/storage/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'theme-mode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface Props {
  children: ReactNode;
}

export function ThemeProvider({ children }: Props) {
  const [mode, setModeState] = useState<ThemeMode>(
    () => (storage.get<ThemeMode>(STORAGE_KEY) ?? 'system'),
  );

  const resolved: 'light' | 'dark' = mode === 'system' ? getSystemTheme() : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
  }, [resolved]);

  useEffect(() => {
    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(getSystemTheme());
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  function setMode(next: ThemeMode) {
    setModeState(next);
    storage.set(STORAGE_KEY, next);
  }

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
