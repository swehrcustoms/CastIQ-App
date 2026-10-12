import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PopulationCharts } from '../fisheries/PopulationCharts';
import { DataFreshnessBadge, FilterChip, MetricCard } from '../ui/Data';
import { EmptyState, ErrorState, SkeletonGrid } from '../ui/States';
import { SectionHeader } from '../ui/Chrome';
import { useLakeFisheries } from '../../hooks/useLakeFisheries';
import { buildFisheryInsights } from '../../utils/fisheriesInsights';
import { canonicalSpecies, speciesLabel, speciesMatches } from '../../utils/species';
import { toDate } from '../../utils/dates';
import { SPECIES_OPTIONS } from '../shared/SpeciesChips';

export function SurveysStockingPanel({ lakeId }: { lakeId: string }) {
  const { data, loading, error, reload } = useLakeFisheries(lakeId);
  const [species, setSpecies] = useState('all');

  const options = useMemo(() => {
    const found = new Set<string>();
    for (const record of [...data.netting, ...data.electro, ...data.stocking]) {
      found.add(canonicalSpecies(record.species));
    }
    const known = SPECIES_OPTIONS.filter((option) => option.id === 'all' || found.has(option.id));
    const extras = [...found]
      .filter((id) => !SPECIES_OPTIONS.some((option) => option.id === id))
      .map((id) => ({ id, label: speciesLabel(id) }));
    return [...known, ...extras];
  }, [data]);

  if (loading) return <SkeletonGrid count={3} />;
  if (error) return <ErrorState title="We couldn't load survey data." onRetry={reload} />;

  const hasAny = data.netting.length + data.electro.length + data.stocking.length + data.creel.length > 0;
  if (!hasAny) {
    return (
      <EmptyState
        title="Survey data has not been published for this lake yet."
        message="Minnesota DNR surveys will show up here when that lake has a published fisheries survey."
      />
    );
  }

  const latestNetting = data.netting.find((record) => speciesMatches(record.species, species)) ?? data.netting[0];
  const latestStock = data.stocking.find((event) => speciesMatches(event.species, species)) ?? data.stocking[0];
  const insight = buildFisheryInsights({ ...data, species })[0];
  const freshness = toDate(latestNetting?.surveyDate ?? latestStock?.stockingDate ?? null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DataFreshnessBadge date={freshness} prefix="Survey" />
        <Link to={`/lake/${lakeId}/fisheries`} className="text-sm font-medium text-castiq-teal hover:underline">
          Open Fisheries Explorer
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {options.map((option) => (
          <FilterChip key={option.id} selected={species === option.id} onClick={() => setSpecies(option.id)}>
            {option.label}
          </FilterChip>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Newest survey"
          value={latestNetting ? String(latestNetting.surveyYear) : 'No recent data'}
          detail={latestNetting ? `${speciesLabel(latestNetting.species)} · ${latestNetting.gear}` : undefined}
        />
        <MetricCard
          label="Latest stocking"
          value={latestStock ? speciesLabel(latestStock.species) : 'No recent data'}
          detail={latestStock ? `${latestStock.year} · ${latestStock.count.toLocaleString()} ${latestStock.lifestage}` : undefined}
        />
        <MetricCard
          label="What the record suggests"
          value={insight ? 'From published surveys' : 'No recent data'}
          detail={insight?.text ?? 'Not enough history to summarize a trend.'}
        />
      </div>

      <PopulationCharts netting={data.netting} electro={data.electro} species={species} />

      <section>
        <SectionHeader title="Recent stocking" />
        {data.stocking.filter((event) => speciesMatches(event.species, species)).length === 0 ? (
          <p className="text-sm text-castiq-muted">No stocking records match this selection.</p>
        ) : (
          <ul className="space-y-2">
            {data.stocking
              .filter((event) => speciesMatches(event.species, species))
              .slice(0, 5)
              .map((event) => (
                <li key={event.id} className="ciq-card flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="font-medium text-castiq-white">
                    {event.year} · {speciesLabel(event.species)}
                  </span>
                  <span className="text-castiq-muted">
                    {event.count.toLocaleString()} {event.lifestage}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>

      <details className="ciq-card p-4">
        <summary className="cursor-pointer text-sm font-medium text-castiq-white">Survey records</summary>
        <ul className="mt-3 space-y-2 text-sm text-castiq-muted">
          {data.netting.slice(0, 8).map((record) => (
            <li key={record.id}>
              {record.surveyYear} netting · {speciesLabel(record.species)} · CPUE {record.CPUE} · {record.totalCount} fish
            </li>
          ))}
          {data.electro.slice(0, 4).map((record) => (
            <li key={record.id}>
              {record.surveyYear} electrofishing · {speciesLabel(record.species)} · CPUE {record.CPUE}
            </li>
          ))}
        </ul>
      </details>
      {data.agency?.reportUrl && (
        <p className="text-xs text-castiq-muted">
          Survey numbers are from the Minnesota DNR.{' '}
          <a href={data.agency.reportUrl} target="_blank" rel="noreferrer" className="text-castiq-teal hover:underline">
            DNR lake report
          </a>
        </p>
      )}
    </div>
  );
}
