import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthChange } from '../services/auth';
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
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthChange((u) => {
      unsubProfile?.();
      unsubProfile = undefined;
      setUser(u);

      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      unsubProfile = onSnapshot(
        doc(db, 'users', u.uid),
        (snap) => {
          setProfile(
            snap.exists()
              ? ({ id: snap.id, ...snap.data() } as WithId<CastIQUser>)
              : null
          );
          setLoading(false);
        },
        () => {
          setProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      unsubProfile?.();
    };
  }, []);

  return { user, profile, loading };
}
