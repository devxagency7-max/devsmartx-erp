import { useState } from 'react';
import { storage } from '@/core/storage/storage';

const STORAGE_KEY = 'sidebar-collapsed';

export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => storage.get<boolean>(STORAGE_KEY) ?? false,
  );

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      storage.set(STORAGE_KEY, next);
      return next;
    });
  }

  return { collapsed, toggle };
}
