import { useEffect, useState } from 'react';
import { limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { fetchLakesByIds } from '../services/lakes';
import { docsOf } from '../utils/firestoreDocs';
import type { IceReport } from '../types/events';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export interface IceIntelData {
  reports: WithId<IceReport>[];
  lakes: WithId<Lake>[];
}

const EMPTY: IceIntelData = { reports: [], lakes: [] };

export function useIceIntel() {
  const [data, setData] = useState<IceIntelData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const reportsQuery = query(Collections.iceReports, orderBy('reportDate', 'desc'), limit(80));
    return onSnapshot(
      reportsQuery,
      (snap) => {
        const reports = docsOf<IceReport>(snap);
        void fetchLakesByIds(reports.map((report) => report.lakeId))
          .then((lakes) => {
            setData({ reports, lakes });
            setLoading(false);
          })
          .catch((err: unknown) => {
            console.error(err);
            setData({ reports, lakes: [] });
            setLoading(false);
          });
      },
      (err: unknown) => {
        console.error(err);
        setData(EMPTY);
        setError(err instanceof Error ? err : new Error('Failed to load ice reports'));
        setLoading(false);
      },
    );
  }, [retry]);

  return {
    data,
    loading,
    error,
    reload: () => setRetry((value) => value + 1),
  };
}
