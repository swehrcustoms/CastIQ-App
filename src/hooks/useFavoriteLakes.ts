import { fetchDnrLake } from '../services/dnrLakeSearch';
import { fetchLakesByIds } from '../services/lakes';
import { useAsyncData } from './useAsyncData';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export function useFavoriteLakes(ids: string[] | undefined) {
  const wanted = ids ?? [];
  const key = [...wanted].sort().join('|');
  return useAsyncData<WithId<Lake>[]>(
    [],
    async () => {
      const stored = await fetchLakesByIds(wanted);
      const found = new Set(stored.map((lake) => lake.id));
      const extras = (
        await Promise.all(wanted.filter((id) => !found.has(id)).map((id) => fetchDnrLake(id)))
      ).filter((lake): lake is WithId<Lake> => lake != null);
      const byId = new Map([...stored, ...extras].map((lake) => [lake.id, lake]));
      return wanted.flatMap((id) => {
        const lake = byId.get(id);
        return lake ? [lake] : [];
      });
    },
    [key],
  );
}
