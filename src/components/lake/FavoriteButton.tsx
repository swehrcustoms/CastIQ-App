import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { setFavoriteLake } from '../../services/userProfile';

export function FavoriteButton({ lakeId }: { lakeId: string }) {
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saved = profile?.favoriteLakeIds?.includes(lakeId) ?? false;

  async function toggle() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await setFavoriteLake(user.uid, lakeId, !saved);
    } catch (err) {
      console.error(err);
      setError('Could not update favorites.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy || !user}
        aria-pressed={saved}
        className={`ciq-btn-secondary ${saved ? 'text-castiq-teal' : ''}`}
      >
        {saved ? 'Saved lake' : 'Save lake'}
      </button>
      {error && <p className="text-xs text-castiq-red">{error}</p>}
    </div>
  );
}
