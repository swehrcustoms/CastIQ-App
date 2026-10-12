import { getDocs, limit, orderBy, query } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { fetchLakesByIds } from '../services/lakes';
import { useAsyncData } from './useAsyncData';
import { docsOf } from '../utils/firestoreDocs';
import type { IceReport, IceRoad, WinterkillEvent } from '../types/events';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export interface IceIntelData {
  reports: WithId<IceReport>[];
  roads: WithId<IceRoad>[];
  winterkill: WithId<WinterkillEvent>[];
  lakes: WithId<Lake>[];
}

const EMPTY: IceIntelData = { reports: [], roads: [], winterkill: [], lakes: [] };

export function useIceIntel() {
  return useAsyncData<IceIntelData>(
    EMPTY,
    async () => {
      const [reportsSnap, roadsSnap, winterkillSnap] = await Promise.all([
        getDocs(query(Collections.iceReports, orderBy('reportDate', 'desc'), limit(80))),
        getDocs(query(Collections.iceRoads, limit(40))),
        getDocs(query(Collections.winterkillEvents, orderBy('eventYear', 'desc'), limit(12))),
      ]);
      const reports = docsOf<IceReport>(reportsSnap);
      const roads = docsOf<IceRoad>(roadsSnap);
      const winterkill = docsOf<WinterkillEvent>(winterkillSnap);
      const lakes = await fetchLakesByIds([
        ...reports.map((report) => report.lakeId),
        ...roads.map((road) => road.lakeId),
        ...winterkill.map((event) => event.lakeId),
      ]);
      return { reports, roads, winterkill, lakes };
    },
    [],
  );
}
