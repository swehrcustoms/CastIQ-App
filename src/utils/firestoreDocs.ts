import type { DocumentData, QuerySnapshot } from 'firebase/firestore';
import type { WithId } from '../types/common';

export function docsOf<T extends DocumentData>(snap: QuerySnapshot<T>): WithId<T>[] {
  return snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }));
}
