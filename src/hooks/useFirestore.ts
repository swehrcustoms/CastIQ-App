import { useState, useEffect } from 'react';
import {
  getDoc,
  onSnapshot,
  query,
  getDocs,
} from 'firebase/firestore';
import type {
  CollectionReference,
  DocumentReference,
  Query,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import type { WithId } from '../types/common';

export interface UseDocumentResult<T> {
  data: WithId<T> | null;
  loading: boolean;
  error: Error | null;
}

export interface UseCollectionResult<T> {
  data: WithId<T>[];
  loading: boolean;
  error: Error | null;
}

export function useDocument<T extends DocumentData>(
  ref: DocumentReference<T> | null
): UseDocumentResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as WithId<T>) : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [ref]);

  return { data, loading, error };
}

export function useCollection<T extends DocumentData>(
  collectionRef: CollectionReference<T> | null,
  ...constraints: QueryConstraint[]
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionRef) {
      setLoading(false);
      return;
    }
    const q: Query<T> = constraints.length > 0
      ? query(collectionRef, ...constraints)
      : query(collectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WithId<T>)));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionRef]);

  return { data, loading, error };
}

export async function fetchDocument<T extends DocumentData>(
  ref: DocumentReference<T>
): Promise<WithId<T> | null> {
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WithId<T>;
}

export async function fetchCollection<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  ...constraints: QueryConstraint[]
): Promise<WithId<T>[]> {
  const q: Query<T> = constraints.length > 0
    ? query(collectionRef, ...constraints)
    : query(collectionRef);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WithId<T>));
}
