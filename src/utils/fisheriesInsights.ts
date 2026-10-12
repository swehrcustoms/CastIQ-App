import type { CreelSurvey, ElectrofishingSurvey, NettingSurvey } from '../types/surveys';
import type { StockingEvent, WinterkillEvent } from '../types/events';
import type { WithId } from '../types/common';
import { speciesLabel, speciesMatches } from './species';

export interface FisheryInsight {
  id: string;
  text: string;
}

interface Point {
  year: number;
  cpue: number;
}

function pointsFor(
  records: Array<{ species: string; surveyYear: number; CPUE: number }>,
  species: string,
): Point[] {
  const byYear = new Map<number, number[]>();
  for (const record of records) {
    if (!speciesMatches(record.species, species)) continue;
    if (typeof record.CPUE !== 'number') continue;
    const bucket = byYear.get(record.surveyYear) ?? [];
    bucket.push(record.CPUE);
    byYear.set(record.surveyYear, bucket);
  }
  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, values]) => ({
      year,
      cpue: values.reduce((sum, value) => sum + value, 0) / values.length,
    }));
}

function trendSentence(name: string, points: Point[]): string | null {
  if (points.length < 2) return null;
  const recent = points.slice(-3);
  const first = recent[0];
  const last = recent[recent.length - 1];
  if (first.cpue <= 0) return null;
  const change = (last.cpue - first.cpue) / first.cpue;
  const span = recent.length >= 3 ? 'the last three surveys' : 'the available surveys';
  if (Math.abs(change) < 0.15) {
    return `${name} survey catch rates have remained stable across ${span}.`;
  }
  if (change > 0) {
    return `${name} survey catch rates are higher than earlier surveys in this series.`;
  }
  return `${name} survey catch rates are lower than earlier surveys in this series.`;
}

export function buildFisheryInsights(input: {
  netting: Array<WithId<NettingSurvey> | NettingSurvey>;
  electro: Array<WithId<ElectrofishingSurvey> | ElectrofishingSurvey>;
  stocking: Array<WithId<StockingEvent> | StockingEvent>;
  creel: Array<WithId<CreelSurvey> | CreelSurvey>;
  winterkill: Array<WithId<WinterkillEvent> | WinterkillEvent>;
  species: string;
}): FisheryInsight[] {
  const insights: FisheryInsight[] = [];
  const speciesIds = input.species === 'all'
    ? [...new Set(input.netting.map((record) => record.species))].slice(0, 4)
    : [input.species];

  for (const speciesId of speciesIds) {
    const combined = [
      ...input.netting.map((record) => ({
        species: record.species,
        surveyYear: record.surveyYear,
        CPUE: record.CPUE,
      })),
      ...input.electro.map((record) => ({
        species: record.species,
        surveyYear: record.surveyYear,
        CPUE: record.CPUE,
      })),
    ];
    const sentence = trendSentence(speciesLabel(speciesId), pointsFor(combined, speciesId));
    if (sentence) insights.push({ id: `trend-${speciesId}`, text: sentence });
  }

  const stockings = [...input.stocking]
    .filter((event) => speciesMatches(event.species, input.species))
    .sort((a, b) => b.year - a.year);
  const latestStock = stockings[0];
  if (latestStock && latestStock.year >= new Date().getFullYear() - 3) {
    insights.push({
      id: `stock-${latestStock.year}-${latestStock.species}`,
      text: `${speciesLabel(latestStock.species)} were stocked in ${latestStock.year} (${latestStock.lifestage}, ${latestStock.count.toLocaleString()} fish). Recent stocking can strengthen a year class, but it does not guarantee future catch rates.`,
    });
  }

  const kill = [...input.winterkill].sort((a, b) => b.eventYear - a.eventYear)[0];
  if (kill) {
    const speciesNote = kill.affectedSpecies?.length
      ? ` Affected species on record: ${kill.affectedSpecies.map(speciesLabel).join(', ')}.`
      : '';
    insights.push({
      id: `kill-${kill.eventYear}`,
      text: `A ${kill.severity} winterkill was recorded in ${kill.eventYear}.${speciesNote}`,
    });
  }

  const creel = [...input.creel]
    .filter((survey) => speciesMatches(survey.targetSpecies, input.species))
    .sort((a, b) => b.surveyYear - a.surveyYear)[0];
  if (creel) {
    insights.push({
      id: `creel-${creel.surveyYear}`,
      text: `The ${creel.surveyYear} creel survey recorded ${creel.anglerHours.toLocaleString()} angler hours and ${creel.catchPerHour} fish per hour for ${speciesLabel(creel.targetSpecies)}.`,
    });
  }

  return insights.slice(0, 5);
}
