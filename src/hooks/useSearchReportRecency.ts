import { useEffect, useState } from 'react';
import { limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { recencyFromReports, type ReportRecency } from '../utils/lakeSort';
import type { AnglerReport } from '../types/user';

/** Live newest-report time for each lake currently on the search page. */
export function useSearchReportRecency(lakeIds: string[]): Record<string, ReportRecency> {
  const key = [...new Set(lakeIds.filter(Boolean))].sort().join('\n');
  const [recency, setRecency] = useState<Record<string, ReportRecency>>({});

  useEffect(() => {
    const ids = key ? key.split('\n') : [];
    if (ids.length === 0) {
      setRecency({});
      return;
    }

    const next: Record<string, ReportRecency> = {};
    const unsubs = ids.map((lakeId) => {
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
          const reports = snap.docs.map((docSnap) => docSnap.data() as AnglerReport);
          next[lakeId] = recencyFromReports(reports);
          setRecency({ ...next });
        },
        (err: unknown) => {
          console.error(err);
        },
      );
    });

    return () => {
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [key]);

  return recency;
}
