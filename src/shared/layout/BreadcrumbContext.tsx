import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { BreadcrumbItem } from './Breadcrumb';

interface BreadcrumbContextValue {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<BreadcrumbItem[]>([]);
  const setItems = useCallback((next: BreadcrumbItem[]) => setItemsState(next), []);
  return (
    <BreadcrumbContext.Provider value={{ items, setItems }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

const EMPTY: BreadcrumbContextValue = { items: [], setItems: () => undefined };

export function useBreadcrumb(): BreadcrumbContextValue {
  return useContext(BreadcrumbContext) ?? EMPTY;
}
