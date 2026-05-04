export type { Timestamp, GeoPoint } from 'firebase/firestore';

export type WithId<T> = T & { id: string };
