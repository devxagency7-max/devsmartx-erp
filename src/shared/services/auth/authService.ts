import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { firebaseAuth } from '@/core/firebase/auth';
import { AuthenticationError } from '@/shared/errors/AuthenticationError';
import type { AuthenticatedUser } from '@/shared/types/auth/AuthenticatedUser';

function mapFirebaseUser(user: User): AuthenticatedUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    companyContext: null,
  };
}

function handleFirebaseError(error: unknown): never {
  if (error instanceof Error && 'code' in error) {
    throw AuthenticationError.fromFirebaseCode((error as { code: string }).code);
  }
  throw new AuthenticationError('unknown', 'An unexpected error occurred.');
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthenticatedUser> {
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return mapFirebaseUser(credential.user);
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  getCurrentUser(): AuthenticatedUser | null {
    const user = firebaseAuth.currentUser;
    return user ? mapFirebaseUser(user) : null;
  },

  async refreshToken(): Promise<string | null> {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    try {
      return await user.getIdToken(true);
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  onAuthStateChanged(callback: (user: AuthenticatedUser | null) => void): Unsubscribe {
    return firebaseOnAuthStateChanged(firebaseAuth, (firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  },
};
