import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLakeSearch } from '../hooks/useLakeSearch';
import { fetchDnrSpecialRegulations, lakePlaceLabel } from '../services/dnrLakeSearch';
import type { LakeSpecialRegulation } from '../services/dnrLakeSearch';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import {
  STATEWIDE_GROUPS,
  STATEWIDE_REGULATIONS,
  STATEWIDE_SOURCE,
  STATEWIDE_YEAR,
} from '../data/statewideRegulations';
import type { StatewideRule } from '../data/statewideRegulations';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

function RuleCard({ rule }: { rule: StatewideRule }) {
  return (
    <article className="rounded-xl bg-castiq-blue px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-castiq-white">{rule.species}</h3>
        {rule.zone && <span className="shrink-0 text-right text-xs text-castiq-teal">{rule.zone}</span>}
      </div>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-castiq-muted">Season</dt>
          <dd className="text-castiq-white">{rule.season}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-castiq-muted">Limit</dt>
          <dd className="text-castiq-white">{rule.limit}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-castiq-muted">Size</dt>
          <dd className="text-castiq-white">{rule.size}</dd>
        </div>
      </dl>
      {rule.note && <p className="mt-2 text-xs text-castiq-muted">{rule.note}</p>}
    </article>
  );
}

export function Regulations() {
  const [lakeQuery, setLakeQuery] = useState('');
  const [selectedLake, setSelectedLake] = useState<WithId<Lake> | null>(null);
  const [specials, setSpecials] = useState<LakeSpecialRegulation[]>([]);
  const [specialsLoading, setSpecialsLoading] = useState(false);
  const [specialsError, setSpecialsError] = useState<string | null>(null);

  const { results, loading: searchLoading } = useLakeSearch(lakeQuery, {}, 10);
  const inlandLake = Boolean(selectedLake && selectedLake.borderWater !== true);

  useEffect(() => {
    if (!selectedLake) {
      setSpecials([]);
      setSpecialsError(null);
      setSpecialsLoading(false);
      return;
    }

    let cancelled = false;
    setSpecialsLoading(true);
    setSpecialsError(null);
    fetchDnrSpecialRegulations(selectedLake)
      .then((rules) => {
        if (!cancelled) setSpecials(rules);
      })
      .catch(() => {
        if (!cancelled) setSpecialsError('Lake regulations could not be loaded. Try that lake again.');
      })
      .finally(() => {
        if (!cancelled) setSpecialsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedLake]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 pb-28">
      <div>
        <h1 className="text-xl font-bold text-castiq-white">Regulations</h1>
        <p className="mt-1 text-sm text-castiq-muted">
          Minnesota inland regulations for {STATEWIDE_YEAR}. These state rules stay on this page until you
          select a lake. Confirm them with the{' '}
          <a href={STATEWIDE_SOURCE} target="_blank" rel="noreferrer" className="text-castiq-teal hover:underline">
            DNR fishing regulations
          </a>{' '}
          before you keep fish. Border waters and Lake Superior use their own rules.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-castiq-muted">
          Lake regulations
        </h2>
        <input
          type="search"
          value={lakeQuery}
          onChange={(e) => setLakeQuery(e.target.value)}
          placeholder="Search a lake for its special regulations…"
          className="w-full rounded-lg bg-castiq-blue px-4 py-3 text-sm text-castiq-white outline-none ring-1 ring-castiq-blue focus:ring-castiq-teal"
        />

        {lakeQuery && (
          <div className="max-h-48 overflow-y-auto rounded-lg border border-castiq-blue">
            {searchLoading ? (
              <div className="flex justify-center py-3">
                <LoadingSpinner size="sm" />
              </div>
            ) : results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-castiq-muted">No lakes match that name.</p>
            ) : (
              results.map((lake) => (
                <button
                  key={lake.id}
                  type="button"
                  onClick={() => {
                    setSpecials([]);
                    setSpecialsError(null);
                    setSpecialsLoading(true);
                    setSelectedLake(lake);
                    setLakeQuery('');
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-castiq-white hover:bg-castiq-blue"
                >
                  {lake.name}
                  <span className="ml-2 text-xs text-castiq-muted">{lakePlaceLabel(lake)}</span>
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
                <p className="text-xs text-castiq-muted">{lakePlaceLabel(selectedLake)}</p>
                <Link to={`/lake/${selectedLake.id}`} className="text-xs text-castiq-teal hover:underline">
                  Open lake detail →
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLake(null)}
                className="text-xs text-castiq-muted hover:text-castiq-white"
              >
                Back to statewide
              </button>
            </div>

            {specialsLoading && (
              <div className="flex justify-center py-6">
                <LoadingSpinner />
              </div>
            )}

            {specialsError && <p className="text-sm text-red-300">{specialsError}</p>}

            {!specialsLoading && !specialsError && specials.length === 0 && (
              <p className="text-sm text-castiq-muted">
                {selectedLake.borderWater
                  ? 'The DNR does not list a special regulation for this border water in the lake record.'
                  : 'The DNR does not list a special regulation for this lake. The statewide inland rules below apply.'}
              </p>
            )}

            {specials.length > 0 && (
              <ul className="space-y-2">
                {specials.map((rule) => (
                  <li
                    key={`${rule.species}-${rule.location}-${rule.text}`}
                    className="rounded-lg bg-castiq-blue-dark/60 px-3 py-3 text-sm"
                  >
                    <p className="font-medium text-castiq-white">{rule.species}</p>
                    <p className="mt-1 text-castiq-muted">{rule.text}</p>
                    {rule.location && <p className="mt-1 text-xs text-castiq-teal">{rule.location}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {(!selectedLake || inlandLake) && (
        <section className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-castiq-muted">
              {selectedLake ? `Statewide inland rules for ${selectedLake.name}` : `Statewide inland rules (${STATEWIDE_YEAR})`}
            </h2>
            <p className="mt-1 text-xs text-castiq-muted">
              {selectedLake
                ? `These ${STATEWIDE_YEAR} inland rules apply to ${selectedLake.name} except where a special regulation above says otherwise.`
                : 'Daily and possession limits are the same unless a species says otherwise. A lake can replace these with a special regulation.'}
            </p>
          </div>
          {STATEWIDE_GROUPS.map((group) => (
            <div key={group} className="space-y-2">
              <h3 className="text-sm font-semibold text-castiq-white">{group}</h3>
              {STATEWIDE_REGULATIONS.filter((rule) => rule.group === group).map((rule) => (
                <RuleCard key={rule.id} rule={rule} />
              ))}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
