import { useState } from 'react';
import { PageContainer, PageHeader } from '../components/ui/Chrome';
import { AppCard } from '../components/ui/Data';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  LIVE_CHECKOUT_ENABLED,
  PLANS,
  PRICING_DISCLAIMER,
  PRICING_HERO,
  priceFor,
  type BillingInterval,
} from '../data/pricing';

export function Pricing() {
  usePageTitle('Pricing');
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <PageContainer>
      <PageHeader eyebrow="Plans" title={PRICING_HERO.title} subtitle={PRICING_HERO.description} />

      <div className="mb-5 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Billing interval">
        {(['monthly', 'annual'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={interval === option}
            onClick={() => setInterval(option)}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium ${
              interval === option ? 'bg-castiq-teal text-castiq-blue-dark' : 'bg-castiq-blue text-castiq-white'
            }`}
          >
            {option === 'monthly' ? 'Monthly' : 'Annual'}
          </button>
        ))}
      </div>

      <ul className="grid gap-4 lg:grid-cols-2">
        {PLANS.map((plan) => {
          const monthly = priceFor(plan.tier, 'monthly');
          const annual = priceFor(plan.tier, 'annual');
          return (
            <li key={plan.tier}>
              <AppCard className={`flex h-full flex-col ${plan.tier === 'premium' ? 'ring-1 ring-castiq-teal' : ''}`}>
                <h2 className="text-lg font-semibold text-castiq-white">{plan.name}</h2>
                <p className={`mt-1 text-2xl font-bold ${interval === 'monthly' ? 'text-castiq-teal' : 'text-castiq-white'}`}>
                  {monthly.display}
                </p>
                <p className="mt-2 text-sm text-castiq-muted">{plan.subtitle}</p>
                {'inherits' in plan && plan.inherits && (
                  <p className="mt-4 text-sm font-medium text-castiq-white">{plan.inherits}</p>
                )}
                <ul className="mt-3 flex-1 list-disc space-y-2 pl-5 text-sm text-castiq-white">
                  {plan.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className={`mt-4 text-sm font-medium ${interval === 'annual' ? 'text-castiq-teal' : 'text-castiq-white'}`}>
                  Annual plan: {annual.display}
                </p>
                <button
                  type="button"
                  className="ciq-btn-primary mt-5"
                  onClick={() =>
                    setNotice(
                      LIVE_CHECKOUT_ENABLED
                        ? 'Checkout is open.'
                        : 'Coming soon. CastIQ is not charging for Standard or Premium yet.',
                    )
                  }
                >
                  {LIVE_CHECKOUT_ENABLED ? `Continue with ${plan.name}` : 'Coming soon'}
                </button>
              </AppCard>
            </li>
          );
        })}
      </ul>

      {notice && <p className="mt-4 text-sm text-castiq-muted" role="status">{notice}</p>}
      <p className="mt-6 text-xs text-castiq-muted">{PRICING_DISCLAIMER}</p>
    </PageContainer>
  );
}
