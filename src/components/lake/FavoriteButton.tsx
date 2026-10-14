import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { setFavoriteLake } from '../../services/userProfile';
import { canSaveLake } from '../../subscriptions/entitlements';
import { subscriptionEnforcementEnabled } from '../../subscriptions/flags';
import { currentAccessTier } from '../../subscriptions/membership';
import { UpgradeCard } from '../subscription/UpgradeCard';

export function FavoriteButton({ lakeId }: { lakeId: string }) {
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saved = profile?.favoriteLakeIds?.includes(lakeId) ?? false;

  async function toggle() {
    if (!user) return;
    if (subscriptionEnforcementEnabled() && !saved) {
      const decision = canSaveLake(currentAccessTier(null), profile?.favoriteLakeIds.length ?? 0, false);
      if (!decision.ok) {
        setError(`The ${currentAccessTier(null)} plan can save ${decision.cap} lakes. Remove one before saving another.`);
        return;
      }
    }
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
        {saved ? 'Unfavorite' : 'Favorite'}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-castiq-red">{error}</p>}
      {subscriptionEnforcementEnabled() && error && (
        <UpgradeCard title="Saved lakes" detail="Existing saves stay on the account. New saves wait until the list is under the plan cap." />
      )}
    </div>
  );
}
