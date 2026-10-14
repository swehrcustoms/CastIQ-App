import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { completeGoogleRedirect, onAuthChange } from '../services/auth';
import { db } from '../services/firebase';
import type { CastIQUser } from '../types/user';
import type { WithId } from '../types/common';

export interface AuthState {
  user: User | null;
  profile: WithId<CastIQUser> | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<WithId<CastIQUser> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubProfile: (() => void) | undefined;
    let unsubAuth: (() => void) | undefined;

    void completeGoogleRedirect()
      .catch(() => null)
      .finally(() => {
        if (cancelled) return;
        unsubAuth = onAuthChange((nextUser) => {
          unsubProfile?.();
          unsubProfile = undefined;
          setUser(nextUser);

          if (!nextUser) {
            setProfile(null);
            setLoading(false);
            return;
          }

          unsubProfile = onSnapshot(
            doc(db, 'users', nextUser.uid),
            (snap) => {
              setProfile(
                snap.exists()
                  ? ({ id: snap.id, ...snap.data() } as WithId<CastIQUser>)
                  : null,
              );
              setLoading(false);
            },
            () => {
              setProfile(null);
              setLoading(false);
            },
          );
        });
      });

    return () => {
      cancelled = true;
      unsubAuth?.();
      unsubProfile?.();
    };
  }, []);

  return { user, profile, loading };
}
