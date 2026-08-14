import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/shared/services/auth/authService';
import { useAuthStore } from '@/shared/stores/authStore';
import { seedFirestoreIfEmpty } from '@/core/firebase/firestoreSeed';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        seedFirestoreIfEmpty().catch(console.error);
      }
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return <>{children}</>;
}
