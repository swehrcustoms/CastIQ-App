import { doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Collections } from '../services/firestore';
import { fetchDnrFisheries } from '../services/dnrFisheries';
import type { DnrAgencyProfile } from '../services/dnrFisheries';
import { useAsyncData } from './useAsyncData';
import { docsOf } from '../utils/firestoreDocs';
import type { CreelSurvey, ElectrofishingSurvey, NettingSurvey } from '../types/surveys';
import type { AerationEvent, StockingEvent, WinterkillEvent } from '../types/events';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export interface LakeFisheriesData {
  netting: WithId<NettingSurvey>[];
  electro: WithId<ElectrofishingSurvey>[];
  stocking: WithId<StockingEvent>[];
  creel: WithId<CreelSurvey>[];
  winterkill: WithId<WinterkillEvent>[];
  aeration: WithId<AerationEvent>[];
  agency: DnrAgencyProfile | null;
}

const EMPTY: LakeFisheriesData = {
  netting: [],
  electro: [],
  stocking: [],
  creel: [],
  winterkill: [],
  aeration: [],
  agency: null,
};

async function loadPublished(lakeId: string): Promise<LakeFisheriesData> {
  const [netting, electro, stocking, creel, winterkill, aeration] = await Promise.all([
    getDocs(query(
      Collections.nettingSurveys,
      where('lakeId', '==', lakeId),
      orderBy('surveyYear', 'desc'),
      limit(200),
    )),
    getDocs(query(
      Collections.electrofishingSurveys,
      where('lakeId', '==', lakeId),
      orderBy('surveyYear', 'desc'),
      limit(200),
    )),
    getDocs(query(
      Collections.stockingEvents,
      where('lakeId', '==', lakeId),
      orderBy('stockingDate', 'desc'),
      limit(100),
    )),
    getDocs(query(
      Collections.creelSurveys,
      where('lakeId', '==', lakeId),
      orderBy('surveyYear', 'desc'),
      limit(50),
    )),
    getDocs(query(
      Collections.winterkillEvents,
      where('lakeId', '==', lakeId),
      orderBy('eventYear', 'desc'),
      limit(30),
    )),
    getDocs(query(
      Collections.aerationEvents,
      where('lakeId', '==', lakeId),
      orderBy('eventDate', 'desc'),
      limit(20),
    )),
  ]);

  return {
    netting: docsOf(netting),
    electro: docsOf(electro),
    stocking: docsOf(stocking),
    creel: docsOf(creel),
    winterkill: docsOf(winterkill),
    aeration: docsOf(aeration),
    agency: null,
  };
}

async function loadFisheries(lakeId: string): Promise<LakeFisheriesData> {
  const data = await loadPublished(lakeId).catch(() => ({ ...EMPTY }));

  const published = data.netting.length + data.electro.length + data.stocking.length + data.creel.length;
  if (published > 0) return data;

  const lakeSnap = await getDoc(doc(db, 'lakes', lakeId));
  const lake = lakeSnap.exists() ? ({ id: lakeSnap.id, ...lakeSnap.data() } as WithId<Lake>) : null;
  const agency = await fetchDnrFisheries({
    id: lakeId,
    name: lake?.name,
    county: lake?.county,
  });
  if (!agency) return data;

  return {
    ...data,
    netting: agency.netting,
    electro: agency.electro,
    agency,
  };
}

export function useLakeFisheries(lakeId: string | undefined) {
  return useAsyncData<LakeFisheriesData>(
    EMPTY,
    () => (lakeId ? loadFisheries(lakeId) : Promise.resolve(EMPTY)),
    [lakeId],
  );
}
