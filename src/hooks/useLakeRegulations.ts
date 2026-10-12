import { getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { useAsyncData } from './useAsyncData';
import { docsOf } from '../utils/firestoreDocs';
import type { Regulation, RegulationAlert } from '../types/regulations';
import type { WithId } from '../types/common';

export interface LakeRegulationData {
  regulations: WithId<Regulation>[];
  alerts: WithId<RegulationAlert>[];
}

const EMPTY: LakeRegulationData = { regulations: [], alerts: [] };

export function useLakeRegulations(lakeId: string | undefined) {
  return useAsyncData<LakeRegulationData>(
    EMPTY,
    async () => {
      if (!lakeId) return EMPTY;
      const [regulations, alerts] = await Promise.all([
        getDocs(query(
          Collections.regulations,
          where('lakeId', '==', lakeId),
          orderBy('effectiveYear', 'desc'),
          limit(60),
        )),
        getDocs(query(
          Collections.regulationAlerts,
          where('lakeId', '==', lakeId),
          limit(20),
        )),
      ]);
      return {
        regulations: docsOf<Regulation>(regulations),
        alerts: docsOf<RegulationAlert>(alerts),
      };
    },
    [lakeId],
  );
}
