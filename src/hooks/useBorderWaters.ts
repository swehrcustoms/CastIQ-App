import { getDocs, limit, query, where } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { useAsyncData } from './useAsyncData';
import { docsOf } from '../utils/firestoreDocs';
import type { Lake } from '../types/lake';
import type { BorderWater, RegulationAlert } from '../types/regulations';
import type { WithId } from '../types/common';

export interface BorderWatersData {
  waters: WithId<BorderWater>[];
  alerts: WithId<RegulationAlert>[];
  lakes: WithId<Lake>[];
}

const EMPTY: BorderWatersData = { waters: [], alerts: [], lakes: [] };

export function useBorderWaters() {
  return useAsyncData<BorderWatersData>(
    EMPTY,
    async () => {
      const [waters, alerts, lakes] = await Promise.all([
        getDocs(query(Collections.borderWaters, limit(80))),
        getDocs(query(Collections.regulationAlerts, where('alertType', '==', 'border'), limit(40))),
        getDocs(query(Collections.lakes, where('borderWater', '==', true), limit(80))),
      ]);
      return {
        waters: docsOf<BorderWater>(waters),
        alerts: docsOf<RegulationAlert>(alerts),
        lakes: docsOf<Lake>(lakes),
      };
    },
    [],
  );
}
