import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle(): Promise<void> {
  return signInWithPopup(auth, googleProvider).then(() => undefined);
}

export function signInWithEmail(email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(auth, email, password).then(() => undefined);
}

export function createAccount(email: string, password: string): Promise<void> {
  return createUserWithEmailAndPassword(auth, email, password).then(() => undefined);
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
