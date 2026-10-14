import { useEffect, useState } from 'react';
import { getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { uniqueReports } from '../utils/reportIdentity';
import type { AnglerReport } from '../types/user';

export function useLakeReports(lakeId: string | undefined) {
  const [reports, setReports] = useState<AnglerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!lakeId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setReports([]);

    getDocs(query(
      Collections.anglerReports,
      where('lakeId', '==', lakeId),
      where('isPublic', '==', true),
      orderBy('reportDate', 'desc'),
      limit(40),
    ))
      .then((snap) => {
        if (cancelled) return;
        const loaded = snap.docs.map((docSnap) => {
          const data = docSnap.data() as AnglerReport;
          return { ...data, reportId: data.reportId || docSnap.id };
        });
        setReports(uniqueReports(loaded));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Failed to load reports'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lakeId]);

  return { reports, loading, error };
}
