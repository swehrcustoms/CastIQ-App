import { useCallback, useEffect, useState } from 'react';
import { getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import type { AnglerReport } from '../types/user';
import type { WithId } from '../types/common';

const PAGE = 24;

export function usePublicReports() {
  const [reports, setReports] = useState<WithId<AnglerReport>[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDocs(query(
      Collections.anglerReports,
      where('isPublic', '==', true),
      orderBy('reportDate', 'desc'),
      limit(PAGE),
    ))
      .then((snap) => {
        if (cancelled) return;
        setReports(snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id })));
        setCursor(snap.docs[snap.docs.length - 1] ?? null);
        setHasMore(snap.docs.length === PAGE);
      })
      .catch((err: unknown) => {
        console.error(err);
        if (!cancelled) setError(err instanceof Error ? err : new Error('Request failed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const snap = await getDocs(query(
        Collections.anglerReports,
        where('isPublic', '==', true),
        orderBy('reportDate', 'desc'),
        startAfter(cursor),
        limit(PAGE),
      ));
      setReports((current) => [
        ...current,
        ...snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id })),
      ]);
      setCursor(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err : new Error('Request failed'));
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { reports, loading, loadingMore, hasMore, error, loadMore, reload };
}
