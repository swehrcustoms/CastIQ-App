import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPECIES_OPTIONS } from '../components/shared/SpeciesChips';
import { PageContainer } from '../components/ui/Chrome';
import { FilterChip } from '../components/ui/Data';
import { useAuth } from '../hooks/useAuth';
import { useLakeSearch } from '../hooks/useLakeSearch';
import { lakePlaceLabel } from '../services/dnrLakeSearch';
import { usePageTitle } from '../hooks/usePageTitle';
import { completeOnboarding, skipOnboarding } from '../services/userProfile';
import { speciesLabel } from '../utils/species';
import type { CastIQUser } from '../types/user';

const STEPS = ['Welcome', 'Species', 'Waters', 'Alerts', 'Ready'];

export function Onboarding() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [species, setSpecies] = useState<string[]>(profile?.alertPreferences?.species ?? []);
  const [lakeIds, setLakeIds] = useState<string[]>(profile?.favoriteLakeIds ?? []);
  const [lakeNames, setLakeNames] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [alerts, setAlerts] = useState({
    reportRecency: profile?.alertPreferences?.reportRecency ?? true,
    winterkillAlerts: profile?.alertPreferences?.winterkillAlerts ?? true,
    iceReports: profile?.alertPreferences?.iceReports ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { results, loading } = useLakeSearch(query, {}, 8);
  usePageTitle('Welcome');

  const prefs: CastIQUser['alertPreferences'] = { species, ...alerts };

  async function finish() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await completeOnboarding(user.uid, { favoriteLakeIds: lakeIds, alertPreferences: prefs });
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      setError('We couldn’t save your preferences. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function skip() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await skipOnboarding(user.uid);
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      setError('We couldn’t skip setup. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer className="max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-castiq-teal">Step {step + 1} of {STEPS.length}</p>
      <ol className="mt-3 flex gap-2" aria-label="Onboarding progress">
        {STEPS.map((label, index) => (
          <li key={label} className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-castiq-teal' : 'bg-castiq-blue'}`}>
            <span className="sr-only">{label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {step === 0 && (
          <>
            <h1 className="text-3xl font-bold text-castiq-white">Let's personalize CastIQ.</h1>
            <p className="mt-3 text-sm leading-relaxed text-castiq-muted">
              A few choices help the map, alerts, and lake pages start closer to the fishing you actually do. You can change all of this later in your profile.
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-castiq-white">What are you fishing for?</h1>
            <p className="mt-2 text-sm text-castiq-muted">Pick any species. Skip ahead if you want everything.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SPECIES_OPTIONS.filter((option) => option.id !== 'all').map((option) => (
                <FilterChip
                  key={option.id}
                  selected={species.includes(option.id)}
                  onClick={() => setSpecies((current) => (
                    current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id]
                  ))}
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-castiq-white">Favorite waters</h1>
            <p className="mt-2 text-sm text-castiq-muted">Search and save lakes you return to. This list can stay empty.</p>
            <input
              className="ciq-input mt-4"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lakes"
              aria-label="Search lakes"
            />
            {loading && <p className="mt-3 text-sm text-castiq-muted">Searching…</p>}
            <ul className="mt-3 space-y-2">
              {results.map((lake) => {
                const selected = lakeIds.includes(lake.id);
                return (
                  <li key={lake.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setLakeIds((current) => (
                          current.includes(lake.id) ? current.filter((id) => id !== lake.id) : [...current, lake.id]
                        ));
                        setLakeNames((current) => ({ ...current, [lake.id]: lake.name }));
                      }}
                      className={`ciq-card w-full px-4 py-3 text-left ${selected ? 'ring-1 ring-castiq-teal' : ''}`}
                    >
                      <span className="block text-sm font-medium text-castiq-white">{lake.name}</span>
                      <span className="block text-xs text-castiq-muted">{lakePlaceLabel(lake)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {lakeIds.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {lakeIds.map((id) => (
                  <FilterChip key={id} selected onClick={() => setLakeIds((current) => current.filter((item) => item !== id))}>
                    {lakeNames[id] ?? 'Saved lake'}
                  </FilterChip>
                ))}
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold text-castiq-white">Which alerts would you like?</h1>
            <p className="mt-2 text-sm text-castiq-muted">CastIQ does not send these alerts yet. Preferences are saved for a later release.</p>
            <div className="mt-4 space-y-3">
              <AlertRow label="Report freshness — Coming soon" checked={false} disabled onChange={() => undefined} />
              <AlertRow label="Winterkill" checked={alerts.winterkillAlerts} onChange={(checked) => setAlerts((current) => ({ ...current, winterkillAlerts: checked }))} />
              <AlertRow label="Ice reports" checked={alerts.iceReports} onChange={(checked) => setAlerts((current) => ({ ...current, iceReports: checked }))} />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-2xl font-bold text-castiq-white">You're ready to fish smarter.</h1>
            <ul className="mt-4 space-y-2 text-sm text-castiq-muted">
              <li>Species · {species.length ? species.map(speciesLabel).join(', ') : 'No species pinned'}</li>
              <li>Lakes · {lakeIds.length ? lakeIds.map((id) => lakeNames[id] ?? 'Saved lake').join(', ') : 'None saved yet'}</li>
              <li>
                Alerts · {[
                  alerts.reportRecency ? 'fresh reports' : null,
                  alerts.winterkillAlerts ? 'winterkill' : null,
                  alerts.iceReports ? 'ice' : null,
                ].filter(Boolean).join(', ') || 'None selected'}
              </li>
            </ul>
          </>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-castiq-red" role="alert">{error}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button type="button" className="ciq-btn-secondary" onClick={() => setStep((value) => value - 1)}>
            Back
          </button>
        )}
        {step < 4 && (
          <button type="button" className="ciq-btn-primary" onClick={() => setStep((value) => value + 1)}>
            Continue
          </button>
        )}
        {step === 4 && (
          <button type="button" className="ciq-btn-primary" disabled={busy} onClick={() => void finish()}>
            Explore CastIQ
          </button>
        )}
        <button type="button" className="text-sm text-castiq-muted hover:text-castiq-white" disabled={busy} onClick={() => void skip()}>
          Skip for now
        </button>
      </div>
    </PageContainer>
  );
}

function AlertRow({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className="ciq-card flex items-center justify-between px-4 py-3 text-sm text-castiq-white">
      {label}
      <input type="checkbox" className="h-4 w-4 accent-castiq-teal" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
