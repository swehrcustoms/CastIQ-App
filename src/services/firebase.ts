import { initializeApp, getApps, getApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const configuredAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  // Google only accepts the Firebase handler as the return address.
  // Using this site's hostname produced redirect_uri_mismatch.
  authDomain: configuredAuthDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
void setPersistence(auth, browserLocalPersistence).catch((err: unknown) => {
  console.error(err);
});
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Connect to local emulators in development when VITE_USE_EMULATORS=true
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_EMULATORS === 'true'
) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
