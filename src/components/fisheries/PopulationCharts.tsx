import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppCard, FilterChip } from '../ui/Data';
import { speciesLabel, speciesMatches } from '../../utils/species';
import type { ElectrofishingSurvey, NettingSurvey } from '../../types/surveys';

type Metric = 'cpue' | 'length' | 'weight' | 'count';

const METRICS: { id: Metric; label: string; noun: string }[] = [
  { id: 'cpue', label: 'CPUE', noun: 'CPUE' },
  { id: 'length', label: 'Length', noun: 'Avg length (in)' },
  { id: 'weight', label: 'Weight', noun: 'Avg weight (lb)' },
  { id: 'count', label: 'Sample', noun: 'Fish sampled' },
];

interface YearRow {
  year: number;
  netting: number | null;
  electro: number | null;
}

function average(values: number[]): number | null {
  const usable = values.filter((value) => Number.isFinite(value));
  if (usable.length === 0) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function metricValue(
  record: { CPUE: number; avgLengthIn: number; avgWeightLb: number; totalCount: number },
  metric: Metric,
): number {
  if (metric === 'cpue') return record.CPUE;
  if (metric === 'length') return record.avgLengthIn;
  if (metric === 'weight') return record.avgWeightLb;
  return record.totalCount;
}

function rowsFor(
  netting: NettingSurvey[],
  electro: ElectrofishingSurvey[],
  metric: Metric,
): YearRow[] {
  const years = new Set<number>();
  const nettingByYear = new Map<number, number[]>();
  const electroByYear = new Map<number, number[]>();

  for (const record of netting) {
    years.add(record.surveyYear);
    const bucket = nettingByYear.get(record.surveyYear) ?? [];
    bucket.push(metricValue(record, metric));
    nettingByYear.set(record.surveyYear, bucket);
  }
  for (const record of electro) {
    years.add(record.surveyYear);
    const bucket = electroByYear.get(record.surveyYear) ?? [];
    bucket.push(metricValue(record, metric));
    electroByYear.set(record.surveyYear, bucket);
  }

  return [...years].sort((a, b) => a - b).map((year) => ({
    year,
    netting: average(nettingByYear.get(year) ?? []),
    electro: average(electroByYear.get(year) ?? []),
  }));
}

const tooltipStyle = {
  background: '#0c1f3d',
  border: '1px solid #1a3a5c',
  borderRadius: 8,
  color: '#f8fafc',
  fontSize: 12,
};

export function PopulationCharts({
  netting,
  electro,
  species,
}: {
  netting: NettingSurvey[];
  electro: ElectrofishingSurvey[];
  species: string;
}) {
  const [metric, setMetric] = useState<Metric>('cpue');
  const filteredNetting = netting.filter((record) => speciesMatches(record.species, species));
  const filteredElectro = electro.filter((record) => speciesMatches(record.species, species));
  const active = METRICS.find((item) => item.id === metric) ?? METRICS[0];

  const speciesBars = useMemo(() => {
    if (species !== 'all') return [];
    const latestYear = filteredNetting.reduce((max, record) => Math.max(max, record.surveyYear), 0);
    const grouped = new Map<string, number[]>();
    for (const record of filteredNetting.filter((item) => item.surveyYear === latestYear)) {
      const bucket = grouped.get(record.species) ?? [];
      bucket.push(metricValue(record, metric));
      grouped.set(record.species, bucket);
    }
    return [...grouped.entries()]
      .map(([name, values]) => ({
        species: speciesLabel(name),
        value: average(values) ?? 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredNetting, metric, species]);

  const trend = species === 'all' ? [] : rowsFor(filteredNetting, filteredElectro, metric);
  const hasTrend = trend.filter((row) => row.netting != null || row.electro != null).length >= 2;

  return (
    <AppCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-castiq-white">Population trends</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-castiq-muted">
            CPUE means catch per unit effort: how many fish the survey gear caught for a standard amount of work.
            A higher number usually means the gear encountered more fish. It is not a prediction of your day on the water.
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {METRICS.map((item) => (
            <FilterChip key={item.id} selected={metric === item.id} onClick={() => setMetric(item.id)}>
              {item.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {species === 'all' && speciesBars.length > 0 && (
        <div className="mt-4 h-64">
          <p className="mb-2 text-xs text-castiq-muted">
            Most recent netting year, by species. This is a snapshot, not a trend.
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={speciesBars} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#0c1f3d" vertical={false} />
              <XAxis dataKey="species" stroke="#94a3b8" fontSize={11} interval={0} angle={-20} textAnchor="end" height={56} />
              <YAxis stroke="#94a3b8" fontSize={11} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name={active.noun} fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {species !== 'all' && hasTrend && (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#0c1f3d" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={11} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="netting" name="Netting" stroke="#06b6d4" strokeWidth={2} dot connectNulls />
              <Line type="monotone" dataKey="electro" name="Electrofishing" stroke="#eab308" strokeWidth={2} dot connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-castiq-muted">
            Years with more than one record are averaged. {active.noun}.
          </p>
        </div>
      )}

      {species !== 'all' && !hasTrend && (filteredNetting.length > 0 || filteredElectro.length > 0) && (
        <p className="mt-4 text-sm text-castiq-muted">
          One survey year is on file for {speciesLabel(species)}, so a trend is not available yet.
        </p>
      )}

      {filteredNetting.length === 0 && filteredElectro.length === 0 && (
        <p className="mt-4 text-sm text-castiq-muted">No survey points are published for this selection.</p>
      )}
    </AppCard>
  );
}
