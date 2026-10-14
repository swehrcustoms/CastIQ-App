import { useEffect, useState } from 'react';
import { limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { uniqueReports } from '../utils/reportIdentity';
import type { AnglerReport } from '../types/user';

export function useLakeReports(lakeId: string | undefined) {
  const [reports, setReports] = useState<AnglerReport[]>([]);
  const [loading, setLoading] = useState(Boolean(lakeId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!lakeId) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const reportsQuery = query(
      Collections.anglerReports,
      where('lakeId', '==', lakeId),
      where('isPublic', '==', true),
      orderBy('reportDate', 'desc'),
      limit(40),
    );

    return onSnapshot(
      reportsQuery,
      (snap) => {
        const loaded = snap.docs.map((docSnap) => {
          const data = docSnap.data() as AnglerReport;
          return { ...data, reportId: data.reportId || docSnap.id };
        });
        setReports(uniqueReports(loaded));
        setLoading(false);
      },
      (err: unknown) => {
        console.error(err);
        setReports([]);
        setError(err instanceof Error ? err : new Error('Failed to load reports'));
        setLoading(false);
      },
    );
  }, [lakeId]);

  return { reports, loading, error };
}
