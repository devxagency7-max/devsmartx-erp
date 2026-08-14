import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function Content({ children }: Props) {
  return (
    <main className="flex-1 overflow-y-auto bg-[hsl(var(--background))] p-6">
      {children}
    </main>
  );
}
