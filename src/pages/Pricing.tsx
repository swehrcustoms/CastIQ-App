import { Link } from 'react-router-dom';
import { PublicShell } from '../components/layout/PublicShell';
import { PageContainer, PageHeader, SourceFooter } from '../components/ui/Chrome';
import { AppCard } from '../components/ui/Data';
import { AlertBanner } from '../components/ui/States';
import { useAuth } from '../hooks/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';

const PLANS = [
  {
    name: 'Angler',
    summary: 'The fishing intelligence CastIQ is built around.',
    items: [
      'Lake map and search',
      'Live intelligence when it is available',
      'Fisheries, contours, water quality, and regulations',
      'Ice reports and border-water comparisons',
      'Public community reports',
    ],
    cta: 'Use CastIQ',
    to: '/',
  },
  {
    name: 'Guide',
    summary: 'Portal tools for accounts that have been granted guide access.',
    items: [
      'Assigned lakes',
      'Recent reports for those waters',
      'Guide portal',
    ],
    cta: 'Open Guide Portal',
    to: '/guide',
  },
  {
    name: 'Guide Pro',
    summary: 'The same portal, with API access when it has been enabled on the account.',
    items: [
      'Everything in Guide',
      'API key management inside the portal',
    ],
    cta: 'Open Guide Portal',
    to: '/guide',
  },
];

export function Pricing() {
  const { user } = useAuth();
  usePageTitle('Pricing');

  return (
    <PublicShell>
      <PageContainer>
        <PageHeader
          eyebrow="Plans"
          title="CastIQ access"
          subtitle="Less time scrolling. More time fishing. Billing is not offered in the app."
        />
        <div className="mb-5">
          <AlertBanner>
            CastIQ does not take payment here. Guide tools appear only on accounts that have already been granted access.
          </AlertBanner>
        </div>
        <ul className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <li key={plan.name}>
              <AppCard className="flex h-full flex-col">
                <h2 className="text-lg font-semibold text-castiq-white">{plan.name}</h2>
                <p className="mt-2 text-sm text-castiq-muted">{plan.summary}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-castiq-white">
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link to={user || plan.to === '/guide' ? plan.to : '/login'} className="ciq-btn-primary mt-5">
                  {user || plan.to === '/guide' ? plan.cta : 'Sign in'}
                </Link>
              </AppCard>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <SourceFooter>
            Prices are not listed because checkout is not part of this application. Access shown above matches features that already exist.
          </SourceFooter>
        </div>
      </PageContainer>
    </PublicShell>
  );
}
