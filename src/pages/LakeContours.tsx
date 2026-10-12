import { useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../services/firebase';
import { FeatureMap } from '../components/map/FeatureMap';
import { PageContainer, PageHeader, SourceFooter } from '../components/ui/Chrome';
import { AppCard, FilterChip } from '../components/ui/Data';
import { AlertBanner, EmptyState, ErrorState, SkeletonCard } from '../components/ui/States';
import { isRasterTileUrl, useLakeContours } from '../hooks/useLakeContours';
import { useAsyncData } from '../hooks/useAsyncData';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Lake } from '../types/lake';
import type { LakeStructure } from '../types/contours';
import type { WithId } from '../types/common';

const STRUCTURES: LakeStructure['structureType'][] = ['hump', 'drop-off', 'flat', 'weedline', 'point', 'channel'];

const COLORS: Record<LakeStructure['structureType'], string> = {
  hump: '#06b6d4',
  'drop-off': '#eab308',
  flat: '#94a3b8',
  weedline: '#22c55e',
  point: '#f8fafc',
  channel: '#38bdf8',
};

const NOTES: Record<LakeStructure['structureType'], string> = {
  hump: 'General note: fish often use the top of a hump and the first drop off its edge.',
  'drop-off': 'General note: the transition from shallow to deep water is a common travel lane.',
  flat: 'General note: flats can hold scattered fish. Look for a subtle bottom change.',
  weedline: 'General note: the deep edge of vegetation is a frequent place to make contact.',
  point: 'General note: points interrupt current and bait. The tip and both sides are worth a pass.',
  channel: 'General note: channel edges can concentrate fish where they meet a flat.',
};

const SOURCE_LABEL = {
  navionics: 'Navionics',
  usgs: 'USGS',
  crowdsourced: 'Crowdsourced',
};

export function LakeContours() {
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
  const contours = useLakeContours(lakeId);
  const [active, setActive] = useState<LakeStructure['structureType'][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  usePageTitle(lakeState.data ? `${lakeState.data.name} contours` : 'Contours');

  const visible = useMemo(
    () => contours.data.structures.filter((structure) => active.length === 0 || active.includes(structure.structureType)),
    [active, contours.data.structures],
  );
  const selected = visible.find((structure) => structure.id === selectedId) ?? null;

  function toggle(type: LakeStructure['structureType']) {
    setActive((current) => (
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    ));
  }

  if (lakeState.loading || contours.loading) {
    return (
      <PageContainer>
        <SkeletonCard lines={6} />
      </PageContainer>
    );
  }

  if (lakeState.error || contours.error) {
    return (
      <PageContainer>
        <ErrorState
          title="We couldn't load contour coverage."
          onRetry={() => {
            lakeState.reload();
            contours.reload();
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
  const metadata = contours.data.metadata;
  const tileUrl = isRasterTileUrl(metadata?.tileUrl) ? metadata.tileUrl : null;
  const hasCoverage = Boolean(tileUrl);

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        backTo={`/lake/${lake.id}`}
        backLabel="Back to lake"
        eyebrow="Contours"
        title={lake.name}
        subtitle="Structure you can fish, drawn only from records that exist for this water."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide" role="toolbar" aria-label="Structure filters">
        {STRUCTURES.map((type) => (
          <FilterChip key={type} selected={active.length === 0 || active.includes(type)} onClick={() => toggle(type)}>
            {type}
          </FilterChip>
        ))}
      </div>

      {!hasCoverage && (
        <div className="mb-4">
          <AlertBanner>
            Contour coverage isn't available for this water yet. The map still shows the lake
            {visible.length > 0 ? ' and any published structure points.' : '.'}
          </AlertBanner>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="h-[55vh] min-h-80">
            <FeatureMap
              center={[lake.lng, lake.lat]}
              zoom={12}
              tileUrl={tileUrl}
              bounds={metadata?.coverageBounds}
              selectedId={selected?.id}
              onPointClick={setSelectedId}
              points={visible.map((structure) => ({
                id: structure.id,
                lng: structure.lng,
                lat: structure.lat,
                color: COLORS[structure.structureType],
                label: `${structure.structureType}, ${structure.depthFt} ft`,
              }))}
            />
          </div>
          <div className="grid gap-3 border-t border-white/10 bg-castiq-blue px-4 py-3 text-xs text-castiq-muted sm:grid-cols-2 lg:grid-cols-4">
            <p>Interval · {metadata?.depthContourIntervalFt ? `${metadata.depthContourIntervalFt} ft` : 'Not published'}</p>
            <p>Source · {metadata ? SOURCE_LABEL[metadata.contourSource] : 'No contour source'}</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-castiq-green" /> Verified structure
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-castiq-yellow" /> AI-detected, not verified
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {selected ? (
            <AppCard>
              <p className="text-xs uppercase tracking-wide text-castiq-teal">{selected.structureType}</p>
              <h2 className="mt-1 text-lg font-semibold capitalize text-castiq-white">{selected.structureType}</h2>
              <p className="mt-2 text-sm text-castiq-white">{selected.depthFt} ft</p>
              <p className="mt-2 text-sm text-castiq-muted">
                {selected.verified ? 'Verified' : 'Not verified'}
                {selected.aiDetected ? ' · AI-detected' : ''}
              </p>
              {selected.notes && <p className="mt-3 text-sm text-castiq-white">{selected.notes}</p>}
              <p className="mt-3 text-sm text-castiq-muted">{NOTES[selected.structureType]}</p>
              <p className="mt-3 text-xs text-castiq-muted">
                {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
              </p>
              <button type="button" className="mt-3 text-sm text-castiq-teal" onClick={() => setSelectedId(null)}>
                Close
              </button>
            </AppCard>
          ) : (
            <AppCard>
              <h2 className="text-sm font-semibold text-castiq-white">Structures</h2>
              <p className="mt-1 text-sm text-castiq-muted">
                Select a marker to see depth, verification, and a general fishing note.
              </p>
            </AppCard>
          )}

          {visible.length === 0 ? (
            <EmptyState
              title="No structures published"
              message="Humps, breaks, weedlines, and other spots will appear when they are on file for this lake."
            />
          ) : (
            <ul className="max-h-[40vh] space-y-2 overflow-y-auto">
              {visible.map((structure) => (
                <li key={structure.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(structure.id)}
                    className={`ciq-card flex w-full items-center justify-between px-4 py-3 text-left ${
                      selected?.id === structure.id ? 'ring-1 ring-castiq-teal' : ''
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium capitalize text-castiq-white">{structure.structureType}</span>
                      <span className="block text-xs text-castiq-muted">
                        {structure.depthFt} ft · {structure.verified ? 'Verified' : structure.aiDetected ? 'AI-detected' : 'Unverified'}
                      </span>
                    </span>
                    <span className="h-3 w-3 rounded-full" style={{ background: COLORS[structure.structureType] }} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-castiq-muted">
        {STRUCTURES.map((type) => (
          <span key={type} className="inline-flex items-center gap-1.5 capitalize">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[type] }} />
            {type}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <SourceFooter>
          Contours are drawn only when a tile URL is on file. Structure notes are general habits for that type of spot, not a claim that fish are there today.
        </SourceFooter>
      </div>
    </PageContainer>
  );
}
