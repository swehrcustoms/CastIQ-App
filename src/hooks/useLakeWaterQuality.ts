import { getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { useAsyncData } from './useAsyncData';
import { docsOf } from '../utils/firestoreDocs';
import type { WaterQuality } from '../types/surveys';
import type { WithId } from '../types/common';

export function useLakeWaterQuality(lakeId: string | undefined) {
  return useAsyncData<WithId<WaterQuality>[]>(
    [],
    async () => {
      if (!lakeId) return [];
      const snap = await getDocs(query(
        Collections.waterQuality,
        where('lakeId', '==', lakeId),
        orderBy('sampleDate', 'desc'),
        limit(40),
      ));
      const samples = docsOf<WaterQuality>(snap);
      if (import.meta.env.DEV && samples.length === 0) {
        console.info('[CastIQ] No water quality documents for lake', lakeId);
      }
      return samples;
    },
    [lakeId],
  );
}
