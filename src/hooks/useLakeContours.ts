import { doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Collections } from '../services/firestore';
import { useAsyncData } from './useAsyncData';
import { docsOf } from '../utils/firestoreDocs';
import type { LakeContourMetadata, LakeStructure } from '../types/contours';
import type { WithId } from '../types/common';

export interface LakeContourData {
  metadata: WithId<LakeContourMetadata> | null;
  structures: WithId<LakeStructure>[];
}

const EMPTY: LakeContourData = { metadata: null, structures: [] };

export function isRasterTileUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /^https?:\/\//.test(url) && url.includes('{z}') && url.includes('{x}') && url.includes('{y}');
}

export function useLakeContours(lakeId: string | undefined) {
  return useAsyncData<LakeContourData>(
    EMPTY,
    async () => {
      if (!lakeId) return EMPTY;
      const [direct, listed, structures] = await Promise.all([
        getDoc(doc(db, 'lake_contour_metadata', lakeId)),
        getDocs(query(Collections.lakeContourMetadata, where('lakeId', '==', lakeId), limit(1))),
        getDocs(query(Collections.lakeStructures, where('lakeId', '==', lakeId), limit(200))),
      ]);

      const fromList = docsOf<LakeContourMetadata>(listed)[0] ?? null;
      const metadata = direct.exists()
        ? ({ ...direct.data(), id: direct.id } as WithId<LakeContourMetadata>)
        : fromList;

      if (import.meta.env.DEV && !metadata && structures.empty) {
        console.info('[CastIQ] No contour metadata or structures for lake', lakeId);
      }

      return {
        metadata,
        structures: docsOf<LakeStructure>(structures),
      };
    },
    [lakeId],
  );
}
