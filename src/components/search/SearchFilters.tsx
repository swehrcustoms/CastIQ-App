import type { LakeSearchFilters } from '../../hooks/useLakeSearch';
import { SPECIES_OPTIONS } from '../shared/SpeciesChips';

interface Props {
  filters: LakeSearchFilters;
  onChange: (filters: LakeSearchFilters) => void;
}

export function SearchFilters({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Species */}
      <select
        value={filters.species ?? ''}
        onChange={(e) => onChange({ ...filters, species: e.target.value || undefined })}
        className="rounded-lg bg-castiq-blue px-3 py-2 text-sm text-castiq-white outline-none ring-1 ring-castiq-blue focus:ring-castiq-teal"
      >
        <option value="">All species</option>
        {SPECIES_OPTIONS.slice(1).map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Jurisdiction */}
      <select
        value={filters.jurisdiction ?? 'all'}
        onChange={(e) =>
          onChange({
            ...filters,
            jurisdiction: e.target.value as LakeSearchFilters['jurisdiction'],
          })
        }
        className="rounded-lg bg-castiq-blue px-3 py-2 text-sm text-castiq-white outline-none ring-1 ring-castiq-blue focus:ring-castiq-teal"
      >
        <option value="all">All waters</option>
        <option value="inland">Inland only</option>
        <option value="border">Border waters</option>
      </select>

      {/* Report type */}
      <select
        value={filters.reportType ?? 'both'}
        onChange={(e) =>
          onChange({
            ...filters,
            reportType: e.target.value as LakeSearchFilters['reportType'],
          })
        }
        className="rounded-lg bg-castiq-blue px-3 py-2 text-sm text-castiq-white outline-none ring-1 ring-castiq-blue focus:ring-castiq-teal"
      >
        <option value="both">All reports</option>
        <option value="angler">Angler only</option>
        <option value="dnr">DNR only</option>
      </select>
    </div>
  );
}
