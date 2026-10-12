import { fetchLakesByIds } from '../services/lakes';
import { useAsyncData } from './useAsyncData';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export function useFavoriteLakes(ids: string[] | undefined) {
  const key = [...(ids ?? [])].sort().join('|');
  return useAsyncData<WithId<Lake>[]>(
    [],
    () => fetchLakesByIds(ids ?? []),
    [key],
  );
}
