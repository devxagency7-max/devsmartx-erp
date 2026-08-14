type StorageType = 'local' | 'session';

function getStorage(type: StorageType): Storage {
  return type === 'session' ? sessionStorage : localStorage;
}

export const storage = {
  get<T>(key: string, type: StorageType = 'local'): T | null {
    try {
      const raw = getStorage(type).getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T, type: StorageType = 'local'): void {
    try {
      getStorage(type).setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — fail silently
    }
  },

  remove(key: string, type: StorageType = 'local'): void {
    getStorage(type).removeItem(key);
  },

  clear(type: StorageType = 'local'): void {
    getStorage(type).clear();
  },
};
