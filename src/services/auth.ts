import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { CastIQUser } from '../types/user';

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle(): Promise<User> {
  return signInWithPopup(auth, googleProvider).then((cred) => cred.user);
}

export function signInWithEmail(email: string, password: string): Promise<User> {
  return signInWithEmailAndPassword(auth, email, password).then((cred) => cred.user);
}

export function createAccount(email: string, password: string): Promise<User> {
  return createUserWithEmailAndPassword(auth, email, password).then((cred) => cred.user);
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

export function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export type UserRole = CastIQUser['role'];

/**
 * Ensures a Firestore `users/{uid}` profile exists after Auth sign-in / sign-up.
 * Safe to call on every login — merges without overwriting role if already set.
 */
export async function ensureUserProfile(
  user: User,
  options?: { role?: UserRole; displayName?: string }
): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (options?.displayName && !user.displayName) {
    await updateProfile(user, { displayName: options.displayName });
  }

  if (!snap.exists()) {
    const profile: Record<string, unknown> = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: options?.displayName ?? user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      role: options?.role ?? 'angler',
      favoriteLakeIds: [],
      alertPreferences: {
        species: [],
        reportRecency: true,
        winterkillAlerts: true,
        iceReports: true,
      },
      submittedReportIds: [],
      guidePortalAccess: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return;
  }

  await setDoc(
    ref,
    {
      email: user.email ?? snap.data().email ?? '',
      displayName: user.displayName ?? snap.data().displayName ?? null,
      photoURL: user.photoURL ?? snap.data().photoURL ?? null,
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function authErrorMessage(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  }
}
