import { documentId, getDocs, query, where } from 'firebase/firestore';
import { Collections } from './firestore';
import { docsOf } from '../utils/firestoreDocs';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export async function fetchLakesByIds(ids: string[]): Promise<WithId<Lake>[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return [];

  const chunks: string[][] = [];
  for (let index = 0; index < unique.length; index += 10) {
    chunks.push(unique.slice(index, index + 10));
  }

  const snaps = await Promise.all(
    chunks.map((chunk) => getDocs(query(Collections.lakes, where(documentId(), 'in', chunk)))),
  );
  return snaps.flatMap((snap) => docsOf<Lake>(snap));
}
