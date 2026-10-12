import { getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { useAsyncData } from './useAsyncData';
import { docsOf } from '../utils/firestoreDocs';
import type { AnglerReport } from '../types/user';
import type { WithId } from '../types/common';

export function useUserReports(uid: string | undefined) {
  return useAsyncData<WithId<AnglerReport>[]>(
    [],
    async () => {
      if (!uid) return [];
      const snap = await getDocs(query(
        Collections.anglerReports,
        where('userId', '==', uid),
        orderBy('reportDate', 'desc'),
        limit(30),
      ));
      return docsOf<AnglerReport>(snap);
    },
    [uid],
  );
}
