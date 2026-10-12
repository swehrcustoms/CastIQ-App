import { arrayRemove, arrayUnion, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { db } from './firebase';
import type { CastIQUser } from '../types/user';

function userRef(uid: string) {
  return doc(db, 'users', uid);
}

export async function saveDisplayName(user: User, displayName: string): Promise<void> {
  const name = displayName.trim();
  await updateProfile(user, { displayName: name });
  await updateDoc(userRef(user.uid), {
    displayName: name,
    updatedAt: serverTimestamp(),
  });
}

export async function saveAlertPreferences(
  uid: string,
  alertPreferences: CastIQUser['alertPreferences'],
): Promise<void> {
  await updateDoc(userRef(uid), {
    alertPreferences,
    updatedAt: serverTimestamp(),
  });
}

export async function setFavoriteLake(uid: string, lakeId: string, favorite: boolean): Promise<void> {
  await updateDoc(userRef(uid), {
    favoriteLakeIds: favorite ? arrayUnion(lakeId) : arrayRemove(lakeId),
    updatedAt: serverTimestamp(),
  });
}

export async function completeOnboarding(
  uid: string,
  input: {
    favoriteLakeIds: string[];
    alertPreferences: CastIQUser['alertPreferences'];
  },
): Promise<void> {
  await updateDoc(userRef(uid), {
    favoriteLakeIds: input.favoriteLakeIds,
    alertPreferences: input.alertPreferences,
    onboardingComplete: true,
    updatedAt: serverTimestamp(),
  });
}

export async function skipOnboarding(uid: string): Promise<void> {
  await updateDoc(userRef(uid), {
    onboardingComplete: true,
    updatedAt: serverTimestamp(),
  });
}
