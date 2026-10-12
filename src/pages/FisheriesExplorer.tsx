import { useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../services/firebase';
import { PopulationCharts } from '../components/fisheries/PopulationCharts';
import { PageContainer, PageHeader, SectionHeader, SourceFooter } from '../components/ui/Chrome';
import { AppCard, DataFreshnessBadge, FilterChip, MetricCard } from '../components/ui/Data';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/ui/States';
import { useAsyncData } from '../hooks/useAsyncData';
import { useLakeFisheries } from '../hooks/useLakeFisheries';
import { usePageTitle } from '../hooks/usePageTitle';
import { buildFisheryInsights } from '../utils/fisheriesInsights';
import { toDate } from '../utils/dates';
import { canonicalSpecies, speciesLabel, speciesMatches } from '../utils/species';
import { SPECIES_OPTIONS } from '../components/shared/SpeciesChips';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export function FisheriesExplorer() {
  const { lakeId } = useParams<{ lakeId: string }>();
  const lakeState = useAsyncData<WithId<Lake> | null>(
    null,
    async () => {
      if (!lakeId) return null;
      const snap = await getDoc(doc(db, 'lakes', lakeId));
      if (!snap.exists()) return null;
      return { ...(snap.data() as Lake), id: snap.id };
    },
    [lakeId],
  );
  const fisheries = useLakeFisheries(lakeId);
  const [species, setSpecies] = useState('all');
  usePageTitle(lakeState.data ? `${lakeState.data.name} fisheries` : 'Fisheries Explorer');

  const options = useMemo(() => {
    const found = new Set<string>();
    for (const record of [...fisheries.data.netting, ...fisheries.data.electro, ...fisheries.data.stocking]) {
      found.add(canonicalSpecies(record.species));
    }
    for (const record of fisheries.data.creel) {
      found.add(canonicalSpecies(record.targetSpecies));
    }
    const known = SPECIES_OPTIONS.filter((option) => option.id === 'all' || found.has(option.id));
    const extras = [...found]
      .filter((id) => id && !SPECIES_OPTIONS.some((option) => option.id === id))
      .map((id) => ({ id, label: speciesLabel(id) }));
    return known.length > 0 ? [...known, ...extras] : [{ id: 'all', label: 'All' }, ...extras];
  }, [fisheries.data]);

  const loading = lakeState.loading || fisheries.loading;
  const error = lakeState.error || fisheries.error;

  if (loading) {
    return (
      <PageContainer>
        <SkeletonGrid count={4} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="We couldn't load the fisheries explorer."
          onRetry={() => {
            lakeState.reload();
            fisheries.reload();
          }}
        />
      </PageContainer>
    );
  }

  if (!lakeState.data) {
    return (
      <PageContainer>
        <EmptyState title="Lake not found" message="This water isn't in the CastIQ lake list." />
      </PageContainer>
    );
  }

  const lake = lakeState.data;
  const data = fisheries.data;
  const published = data.netting.length + data.electro.length + data.stocking.length + data.creel.length + data.winterkill.length + data.aeration.length;
  const latestYear = Math.max(
    0,
    ...data.netting.map((record) => record.surveyYear),
    ...data.electro.map((record) => record.surveyYear),
  );
  const dominant = [...data.netting]
    .filter((record) => record.surveyYear === latestYear)
    .sort((a, b) => b.CPUE - a.CPUE)[0];
  const latestStock = [...data.stocking].sort((a, b) => b.year - a.year)[0];
  const latestCreel = data.creel.find((survey) => speciesMatches(survey.targetSpecies, species)) ?? data.creel[0];
  const latestKill = data.winterkill[0];
  const insights = buildFisheryInsights({ ...data, species });
  const freshness = toDate(data.netting[0]?.surveyDate ?? latestStock?.stockingDate ?? null);
  const stockings = data.stocking.filter((event) => speciesMatches(event.species, species));
  const creels = data.creel.filter((survey) => speciesMatches(survey.targetSpecies, species));

  return (
    <PageContainer>
      <PageHeader
        backTo={`/lake/${lake.id}`}
        backLabel="Back to lake"
        eyebrow="Fisheries Explorer"
        title={lake.name}
        subtitle={`${lake.county} County · ${lake.jurisdiction || 'Jurisdiction unavailable'}`}
        actions={<DataFreshnessBadge date={freshness} prefix="DNR survey" />}
      />

      {data.agency?.narrative && (
        <AppCard>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-castiq-white">Minnesota DNR survey</h2>
            <a
              href={data.agency.reportUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-castiq-teal hover:underline"
            >
              Open the DNR lake report
            </a>
          </div>
          <p className="mt-1 text-xs text-castiq-muted">
            {data.agency.surveyDate ? `Latest survey ${data.agency.surveyDate}` : 'Survey date not listed'}
            {data.agency.waterClarityFt
              ? ` · Water clarity ${data.agency.waterClarityFt} ft${data.agency.waterClarityDate ? ` on ${data.agency.waterClarityDate}` : ''}`
              : ''}
          </p>
          <p className="mt-3 max-h-64 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-castiq-white">
            {data.agency.narrative}
          </p>
        </AppCard>
      )}

      {published === 0 ? (
        <EmptyState
          title="Fisheries data has not been published for this lake yet."
          message="Surveys, stocking, and creel records will show up here when they are available."
        />
      ) : (
        <div className="space-y-6">
          {data.agency?.narrative && (
            <AppCard>
              <h2 className="text-base font-semibold text-castiq-white">Minnesota DNR survey notes</h2>
              <p className="mt-1 text-xs text-castiq-muted">
                {data.agency.surveyDate ? `Survey date ${data.agency.surveyDate}. ` : ''}
                Written by the DNR for this lake.
              </p>
              <p className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-castiq-white">
                {data.agency.narrative}
              </p>
            </AppCard>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              label="Dominant game species"
              value={dominant ? speciesLabel(dominant.species) : 'No recent data'}
              detail={dominant ? `Highest netting CPUE in ${dominant.surveyYear}` : 'No netting survey is on file.'}
            />
            <MetricCard
              label="Most recent survey"
              value={latestYear > 0 ? String(latestYear) : 'No recent data'}
              detail={data.netting[0]?.conductedBy || data.electro[0]?.conductedBy || 'Source not listed'}
            />
            <MetricCard
              label="Most recently stocked"
              value={latestStock ? speciesLabel(latestStock.species) : 'No recent data'}
              detail={latestStock ? `${latestStock.year} · ${latestStock.count.toLocaleString()} ${latestStock.lifestage}` : undefined}
            />
            <MetricCard
              label="Fishing pressure"
              value={latestCreel ? String(latestCreel.fishingPressureScore) : 'No recent data'}
              detail={latestCreel ? `${latestCreel.surveyYear} creel · peak ${latestCreel.peakTime || 'time not listed'}` : 'No creel survey is on file.'}
            />
            <MetricCard
              label="Winterkill history"
              value={latestKill ? `${latestKill.severity} · ${latestKill.eventYear}` : 'No events published'}
              detail={latestKill?.outcome || 'No winterkill events have been published for this lake.'}
            />
            <MetricCard
              label="Aeration"
              value={data.aeration[0] ? data.aeration[0].aerationType : lake.hasAeration ? 'Listed on the lake' : 'No recent data'}
              detail={data.aeration[0]?.fundedBy}
            />
            {data.agency?.waterClarityFt != null && (
              <MetricCard
                label="Water clarity"
                value={`${data.agency.waterClarityFt} ft`}
                detail={data.agency.waterClarityDate ? `Secchi reading ${data.agency.waterClarityDate}` : 'Minnesota DNR'}
              />
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide" role="toolbar" aria-label="Species">
            {options.map((option) => (
              <FilterChip key={option.id} selected={species === option.id} onClick={() => setSpecies(option.id)}>
                {option.label}
              </FilterChip>
            ))}
          </div>

          <PopulationCharts netting={data.netting} electro={data.electro} species={species} />

          <section>
            <SectionHeader title="Stocking timeline" />
            {stockings.length === 0 ? (
              <EmptyState
                title="No stocking records in this survey"
                message="The Minnesota DNR lake survey includes catch rates and sizes. It does not include a stocking list for this water."
              />
            ) : (
              <ol className="space-y-3 border-l border-white/10 pl-4">
                {stockings.map((event) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[1.35rem] top-2 h-2.5 w-2.5 rounded-full bg-castiq-teal" />
                    <AppCard>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-semibold text-castiq-white">
                          {event.year} · {speciesLabel(event.species)}
                        </p>
                        <p className="text-sm text-castiq-teal">{event.count.toLocaleString()} fish</p>
                      </div>
                      <p className="mt-1 text-sm text-castiq-muted">
                        {event.lifestage} · {event.avgSizeIn} in avg · {event.method} · {event.hatchery}
                      </p>
                      <p className="mt-1 text-xs text-castiq-muted">
                        {event.purpose} · {event.fundingSource}
                      </p>
                    </AppCard>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <SectionHeader title="Creel and fishing pressure" />
            {creels.length === 0 ? (
              <EmptyState
                title="No creel survey in this file"
                message="Angler hours and harvest rates are not part of the DNR lake survey loaded for this water."
              />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {creels.map((survey) => (
                  <li key={survey.id}>
                    <AppCard className="h-full">
                      <p className="font-semibold text-castiq-white">
                        {survey.surveyYear} · {speciesLabel(survey.targetSpecies)}
                      </p>
                      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-xs text-castiq-muted">Angler hours</dt>
                          <dd>{survey.anglerHours.toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-castiq-muted">Catch / hour</dt>
                          <dd>{survey.catchPerHour}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-castiq-muted">Harvest / hour</dt>
                          <dd>{survey.harvestPerHour}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-castiq-muted">Pressure score</dt>
                          <dd>{survey.fishingPressureScore}</dd>
                        </div>
                      </dl>
                      <p className="mt-3 text-xs text-castiq-muted">Peak time · {survey.peakTime || 'Not listed'} · {survey.conductedBy}</p>
                    </AppCard>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <AppCard>
            <h2 className="text-base font-semibold text-castiq-white">Fisheries intelligence</h2>
            {insights.length === 0 ? (
              <p className="mt-2 text-sm text-castiq-muted">
                There isn't enough published history to summarize a trend for this selection.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {insights.map((insight) => (
                  <li key={insight.id} className="text-sm leading-relaxed text-castiq-white">
                    {insight.text}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-castiq-muted">
              These notes only restate patterns in the loaded surveys. They are not a forecast.
            </p>
          </AppCard>

          <details className="ciq-card p-4">
            <summary className="cursor-pointer text-sm font-medium text-castiq-white">Detailed survey records</summary>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs text-castiq-muted">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Year</th>
                    <th className="py-2 pr-4 font-medium">Gear</th>
                    <th className="py-2 pr-4 font-medium">Species</th>
                    <th className="py-2 pr-4 font-medium">CPUE</th>
                    <th className="py-2 pr-4 font-medium">Length</th>
                    <th className="py-2 font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.netting.filter((record) => speciesMatches(record.species, species)).map((record) => (
                    <tr key={record.id} className="border-t border-white/10">
                      <td className="py-2 pr-4">{record.surveyYear}</td>
                      <td className="py-2 pr-4">{record.gear}</td>
                      <td className="py-2 pr-4">{speciesLabel(record.species)}</td>
                      <td className="py-2 pr-4">{record.CPUE}</td>
                      <td className="py-2 pr-4">{record.avgLengthIn} in</td>
                      <td className="py-2">{record.totalCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <SourceFooter>
            Gill net, trap net, and electrofishing results are from Minnesota DNR lake surveys.
            {data.agency?.reportUrl && (
              <>
                {' '}
                <a href={data.agency.reportUrl} target="_blank" rel="noreferrer" className="text-castiq-teal hover:underline">
                  Open the DNR lake report
                </a>
                .
              </>
            )}
          </SourceFooter>
        </div>
      )}
    </PageContainer>
  );
}
