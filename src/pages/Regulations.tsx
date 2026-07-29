import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDocs, orderBy, query } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { useLakeSearch } from '../hooks/useLakeSearch';
import { useRegulations } from '../hooks/useRegulations';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { SpeciesChips } from '../components/shared/SpeciesChips';
import type { StatewideDefault } from '../types/regulations';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export function Regulations() {
  const [lakeQuery, setLakeQuery] = useState('');
  const [selectedLake, setSelectedLake] = useState<WithId<Lake> | null>(null);
  const [species, setSpecies] = useState('all');
  const [statewide, setStatewide] = useState<WithId<StatewideDefault>[]>([]);
  const [statewideLoading, setStatewideLoading] = useState(true);

  const { results, loading: searchLoading } = useLakeSearch(lakeQuery, {}, 10);
  const {
    regulations,
    alerts,
    loading: regsLoading,
    error,
  } = useRegulations(
    selectedLake?.id ?? null,
    species === 'all' ? undefined : species
  );

  useEffect(() => {
    setStatewideLoading(true);
    getDocs(query(Collections.statewideDefaults, orderBy('species')))
      .then((snap) => {
        setStatewide(
          snap.docs.map(
            (d) => ({ id: d.id, ...d.data() } as WithId<StatewideDefault>)
          )
        );
      })
      .catch(() => setStatewide([]))
      .finally(() => setStatewideLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 pb-28">
      <div>
        <h1 className="text-xl font-bold text-castiq-white">Regulations</h1>
        <p className="mt-1 text-sm text-castiq-muted">
          Minnesota statewide defaults and lake-specific rules. Always verify with
          official DNR sources before fishing.
        </p>
      </div>

      {/* Lake-specific lookup */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-castiq-muted">
          Lake-specific lookup
        </h2>
        <input
          type="search"
          value={lakeQuery}
          onChange={(e) => setLakeQuery(e.target.value)}
          placeholder="Search a lake…"
          className="w-full rounded-lg bg-castiq-blue px-4 py-3 text-sm text-castiq-white outline-none ring-1 ring-castiq-blue focus:ring-castiq-teal"
        />

        {lakeQuery && (
          <div className="max-h-40 overflow-y-auto rounded-lg border border-castiq-blue">
            {searchLoading ? (
              <div className="flex justify-center py-3">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              results.map((lake) => (
                <button
                  key={lake.id}
                  type="button"
                  onClick={() => {
                    setSelectedLake(lake);
                    setLakeQuery('');
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-castiq-white hover:bg-castiq-blue"
                >
                  {lake.name}
                  <span className="ml-2 text-xs text-castiq-muted">{lake.county}</span>
                </button>
              ))
            )}
          </div>
        )}

        {selectedLake && (
          <div className="space-y-3 rounded-xl bg-castiq-blue p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-castiq-white">{selectedLake.name}</p>
                <Link
                  to={`/lake/${selectedLake.id}`}
                  className="text-xs text-castiq-teal hover:underline"
                >
                  Open lake detail →
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLake(null)}
                className="text-xs text-castiq-muted hover:text-castiq-white"
              >
                Clear
              </button>
            </div>

            <SpeciesChips selected={species} onChange={setSpecies} />

            {regsLoading && (
              <div className="flex justify-center py-6">
                <LoadingSpinner />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-300">
                {error.message}. Sign in and ensure Functions are deployed.
              </p>
            )}

            {!regsLoading && !error && regulations.length === 0 && (
              <p className="text-sm text-castiq-muted">
                No lake-specific regulations seeded for this water. Showing statewide
                defaults below. Run{' '}
                <code className="text-castiq-teal">npm run seed:regulations</code> after
                updating the seed script with lake regs.
              </p>
            )}

            {alerts.length > 0 && (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div
                    key={a.alertId}
                    className="rounded-lg border border-castiq-yellow/40 bg-castiq-yellow/10 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-castiq-yellow">{a.title}</p>
                    <p className="text-castiq-muted">{a.body}</p>
                  </div>
                ))}
              </div>
            )}

            <ul className="space-y-2">
              {regulations.map((r) => (
                <li
                  key={r.regId}
                  className="rounded-lg bg-castiq-blue-dark/60 px-3 py-3 text-sm"
                >
                  <p className="font-medium capitalize text-castiq-white">
                    {r.species.replace(/_/g, ' ')}
                  </p>
                  <p className="mt-1 text-xs text-castiq-muted">
                    Daily limit: {r.dailyLimit ?? '—'} · Min size:{' '}
                    {r.minSizeIn != null ? `${r.minSizeIn}"` : '—'} · Open:{' '}
                    {r.openDate}
                    {r.closeDate ? ` – ${r.closeDate}` : ''}
                  </p>
                  {r.specialNotes && (
                    <p className="mt-1 text-xs text-castiq-teal">{r.specialNotes}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Statewide defaults */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-castiq-muted">
          Statewide defaults ({new Date().getFullYear()})
        </h2>
        {statewideLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : statewide.length === 0 ? (
          <p className="text-sm text-castiq-muted">
            No statewide defaults found. Run{' '}
            <code className="text-castiq-teal">npm run seed:regulations</code>.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-castiq-blue">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-castiq-blue text-xs uppercase text-castiq-muted">
                <tr>
                  <th className="px-3 py-2">Species</th>
                  <th className="px-3 py-2">Daily</th>
                  <th className="px-3 py-2">Min</th>
                  <th className="px-3 py-2">Season</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-castiq-blue">
                {statewide.map((r) => (
                  <tr key={r.id} className="bg-castiq-blue-dark/40">
                    <td className="px-3 py-2 capitalize text-castiq-white">
                      {r.species.replace(/_/g, ' ')}
                    </td>
                    <td className="px-3 py-2 text-castiq-muted">
                      {r.dailyLimit ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-castiq-muted">
                      {r.minSizeIn != null ? `${r.minSizeIn}"` : '—'}
                    </td>
                    <td className="px-3 py-2 text-castiq-muted">
                      {r.openDate}
                      {r.closeDate ? ` – ${r.closeDate}` : '+'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
