import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, PageHeader, SourceFooter } from '../components/ui/Chrome';
import { AppCard, FilterChip } from '../components/ui/Data';
import { AlertBanner, EmptyState, ErrorState, SkeletonGrid } from '../components/ui/States';
import { useBorderWaters } from '../hooks/useBorderWaters';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatRelative, toDate } from '../utils/dates';
import { speciesLabel, speciesMatches } from '../utils/species';
import type { BorderWater, RegulationAlert } from '../types/regulations';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchLake(water: BorderWater, lakes: WithId<Lake>[]): WithId<Lake> | undefined {
  const name = normalize(water.waterName);
  return lakes.find((lake) => {
    const lakeName = normalize(lake.name);
    return lakeName === name || lakeName.includes(name) || name.includes(lakeName);
  });
}

function relatedAlerts(water: BorderWater, lake: WithId<Lake> | undefined, alerts: WithId<RegulationAlert>[]) {
  const name = normalize(water.waterName);
  return alerts.filter((alert) => {
    if (lake && alert.lakeId === lake.id) return true;
    const text = normalize(`${alert.title} ${alert.body}`);
    return text.includes(name);
  });
}

export function BorderWaters() {
  const { data, loading, error, reload } = useBorderWaters();
  const [search, setSearch] = useState('');
  const [jurisdiction, setJurisdiction] = useState('all');
  const [species, setSpecies] = useState('all');
  usePageTitle('Border waters');

  const jurisdictions = useMemo(() => {
    const values = new Set<string>();
    for (const water of data.waters) {
      for (const name of water.jurisdictions ?? []) values.add(name);
    }
    return [...values].sort();
  }, [data.waters]);

  const speciesOptions = useMemo(() => {
    const values = new Set<string>();
    for (const water of data.waters) {
      for (const key of [
        ...Object.keys(water.mnDailyLimit ?? {}),
        ...Object.keys(water.partnerDailyLimit ?? {}),
      ]) {
        values.add(key);
      }
    }
    return [...values].sort();
  }, [data.waters]);

  const visible = data.waters.filter((water) => {
    const haystack = `${water.waterName} ${water.jurisdictions?.join(' ') ?? ''}`.toLowerCase();
    if (search.trim() && !haystack.includes(search.trim().toLowerCase())) return false;
    if (jurisdiction !== 'all' && !(water.jurisdictions ?? []).includes(jurisdiction)) return false;
    if (species !== 'all') {
      const keys = [...Object.keys(water.mnDailyLimit ?? {}), ...Object.keys(water.partnerDailyLimit ?? {})];
      if (!keys.some((key) => speciesMatches(key, species))) return false;
    }
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Multi-jurisdiction"
        title="Border Water Intelligence"
        subtitle="Regulations can differ by state, province, or tribal boundary on the same water. Compare the published numbers before you keep fish."
      />

      {loading && <SkeletonGrid count={3} />}
      {error && <ErrorState title="We couldn't load border waters." onRetry={reload} />}

      {!loading && !error && data.waters.length === 0 && (
        <EmptyState
          title="No border waters have been published."
          message="When multi-jurisdiction rules are loaded, they will show up here with the differences called out."
        />
      )}

      {!loading && !error && data.waters.length > 0 && (
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">Search border waters</span>
            <input
              className="ciq-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a border water"
            />
          </label>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide" role="toolbar" aria-label="Jurisdiction">
            <FilterChip selected={jurisdiction === 'all'} onClick={() => setJurisdiction('all')}>All jurisdictions</FilterChip>
            {jurisdictions.map((name) => (
              <FilterChip key={name} selected={jurisdiction === name} onClick={() => setJurisdiction(name)}>
                {name}
              </FilterChip>
            ))}
          </div>

          {speciesOptions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide" role="toolbar" aria-label="Species">
              <FilterChip selected={species === 'all'} onClick={() => setSpecies('all')}>All species</FilterChip>
              {speciesOptions.map((name) => (
                <FilterChip key={name} selected={species === name} onClick={() => setSpecies(name)}>
                  {speciesLabel(name)}
                </FilterChip>
              ))}
            </div>
          )}

          {visible.length === 0 ? (
            <EmptyState title="No waters match these filters." message="Try another jurisdiction or clear the search." />
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {visible.map((water) => {
                const lake = matchLake(water, data.lakes);
                const alerts = relatedAlerts(water, lake, data.alerts);
                const speciesKeys = [...new Set([
                  ...Object.keys(water.mnDailyLimit ?? {}),
                  ...Object.keys(water.partnerDailyLimit ?? {}),
                  ...Object.keys(water.mnMinSizeIn ?? {}),
                  ...Object.keys(water.partnerMinSizeIn ?? {}),
                ])].filter((key) => species === 'all' || speciesMatches(key, species));
                const partnerName = (water.jurisdictions ?? []).find((name) => name.toLowerCase() !== 'mn' && name.toLowerCase() !== 'minnesota') ?? 'Partner';

                return (
                  <li key={water.id}>
                    <AppCard className="h-full space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-semibold text-castiq-white">{water.waterName}</h2>
                          <p className="mt-1 text-sm text-castiq-muted">{(water.jurisdictions ?? []).join(' · ') || 'Jurisdictions not listed'}</p>
                        </div>
                        <span className="text-xs text-castiq-muted">
                          Updated {formatRelative(toDate(water.lastUpdated))}
                        </span>
                      </div>

                      {(water.conflictFlags ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {water.conflictFlags.map((flag) => (
                            <span key={flag} className="rounded-full bg-castiq-yellow/15 px-2.5 py-1 text-xs text-castiq-yellow">
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}

                      {speciesKeys.length === 0 ? (
                        <p className="text-sm text-castiq-muted">No species limits are published on this record.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="text-xs text-castiq-muted">
                              <tr>
                                <th className="py-1 pr-3 font-medium">Species</th>
                                <th className="py-1 pr-3 font-medium">Minnesota</th>
                                <th className="py-1 font-medium">{partnerName}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {speciesKeys.map((key) => {
                                const mnLimit = water.mnDailyLimit?.[key];
                                const partnerLimit = water.partnerDailyLimit?.[key];
                                const mnSize = water.mnMinSizeIn?.[key];
                                const partnerSize = water.partnerMinSizeIn?.[key];
                                const limitDiffers = mnLimit !== partnerLimit;
                                const sizeDiffers = mnSize !== partnerSize;
                                return (
                                  <tr key={key} className="border-t border-white/10">
                                    <td className="py-2 pr-3 text-castiq-white">{speciesLabel(key)}</td>
                                    <td className={`py-2 pr-3 ${limitDiffers || sizeDiffers ? 'text-castiq-yellow' : 'text-castiq-muted'}`}>
                                      {mnLimit == null ? 'Limit not listed' : `${mnLimit} daily`}
                                      {mnSize != null ? ` · min ${mnSize} in` : ''}
                                    </td>
                                    <td className={`py-2 ${limitDiffers || sizeDiffers ? 'text-castiq-yellow' : 'text-castiq-muted'}`}>
                                      {partnerLimit == null ? 'Limit not listed' : `${partnerLimit} daily`}
                                      {partnerSize != null ? ` · min ${partnerSize} in` : ''}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {water.licenseRequired?.length > 0 && (
                        <p className="text-sm text-castiq-muted">
                          Licensing on record: {water.licenseRequired.join(', ')}
                        </p>
                      )}
                      {water.treatyNotes && <p className="text-sm text-castiq-muted">{water.treatyNotes}</p>}
                      {water.partnerRegText && <p className="text-sm text-castiq-muted">{water.partnerRegText}</p>}
                      {water.aiConflictSummary && (
                        <p className="text-sm text-castiq-white">
                          <span className="text-xs uppercase tracking-wide text-castiq-teal">AI summary · </span>
                          {water.aiConflictSummary}
                        </p>
                      )}

                      {alerts.length > 0 ? (
                        <ul className="space-y-2">
                          {alerts.slice(0, 2).map((alert) => (
                            <li key={alert.id}>
                              <AlertBanner tone={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'}>
                                <span className="font-medium">{alert.title}. </span>
                                {alert.body}
                              </AlertBanner>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-castiq-muted">No active alerts on file for this water.</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm">
                        {lake && (
                          <Link to={`/lake/${lake.id}`} className="font-medium text-castiq-teal hover:underline">
                            Open lake
                          </Link>
                        )}
                        <Link
                          to={lake ? `/lake/${lake.id}?tab=regulations` : '/regulations'}
                          className="font-medium text-castiq-teal hover:underline"
                        >
                          Full regulation details
                        </Link>
                      </div>
                    </AppCard>
                  </li>
                );
              })}
            </ul>
          )}

          <SourceFooter>
            Differences are highlighted only when the published Minnesota and partner values are not the same.
            Confirm the official regulation before you fish. {data.waters[0]?.mnRegRef ? `Minnesota reference on file: ${data.waters[0].mnRegRef}.` : ''}
          </SourceFooter>
        </div>
      )}
    </PageContainer>
  );
}
