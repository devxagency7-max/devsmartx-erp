export type AuthErrorCode =
  | 'invalid-credentials'
  | 'expired-session'
  | 'network-error'
  | 'user-not-found'
  | 'too-many-requests'
  | 'unknown';

export class AuthenticationError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }

  static fromFirebaseCode(firebaseCode: string): AuthenticationError {
    switch (firebaseCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return new AuthenticationError('invalid-credentials', 'Invalid email or password.');
      case 'auth/too-many-requests':
        return new AuthenticationError(
          'too-many-requests',
          'Too many attempts. Please try again later.',
        );
      case 'auth/network-request-failed':
        return new AuthenticationError(
          'network-error',
          'Network error. Please check your connection.',
        );
      case 'auth/user-token-expired':
      case 'auth/requires-recent-login':
        return new AuthenticationError('expired-session', 'Your session has expired. Please sign in again.');
      default:
        return new AuthenticationError('unknown', 'An unexpected error occurred.');
    }
  }
}
