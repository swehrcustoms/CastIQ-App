import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

function authCode(err: unknown): string {
  return err && typeof err === 'object' && 'code' in err
    ? String((err as { code: string }).code)
    : '';
}

/**
 * Popup first. Embedded browsers (including the IDE browser) block the popup,
 * so those attempts continue with a full-page Google redirect.
 */
export async function signInWithGoogle(): Promise<User | 'redirect'> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (err) {
    const code = authCode(err);
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return 'redirect';
    }
    throw err;
  }
}

let redirectResult: Promise<User | null> | null = null;

/** Completes a Google redirect that returns the browser to /login. Called once per page load. */
export function completeGoogleRedirect(): Promise<User | null> {
  if (!redirectResult) {
    redirectResult = getRedirectResult(auth)
      .then((result) => result?.user ?? null)
      .catch((err: unknown) => {
        redirectResult = null;
        throw err;
      });
  }
  return redirectResult;
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
): Promise<{ created: boolean }> {
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
      onboardingComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return { created: true };
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
  return { created: false };
}

export function authErrorMessage(err: unknown): string {
  const code = authCode(err);
  if (import.meta.env.DEV && code) {
    console.info('[CastIQ] Auth error', code);
  }

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
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was closed before it finished.';
    case 'auth/popup-blocked':
      return 'This browser blocked the Google window. Try again, or use email instead.';
    case 'auth/unauthorized-domain':
      return 'This address is not allowed for Google sign-in yet.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Sign-in failed. Please try again.';
  }
}
