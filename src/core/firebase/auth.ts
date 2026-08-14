import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseApp } from './firebase';

export const firebaseAuth = getAuth(firebaseApp);

// Persist session across browser refreshes using Firebase's built-in mechanism.
// Never use localStorage manually — Firebase handles this internally.
void setPersistence(firebaseAuth, browserLocalPersistence);
