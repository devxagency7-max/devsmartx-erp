import { initializeApp, getApps } from 'firebase/app';
import { environment } from '@/core/config/environment';

// Prevent re-initialization during hot module reload
export const firebaseApp =
  getApps().length === 0
    ? initializeApp(environment.firebase)
    : getApps()[0];
