import { PageContainer, PageHeader, SourceFooter } from '../components/ui/Chrome';
import { usePageTitle } from '../hooks/usePageTitle';

export function Privacy() {
  usePageTitle('Privacy');
  return (
    <>
      {/* Legal review required before this copy is treated as a privacy policy. */}
      <PageContainer className="max-w-3xl">
        <PageHeader
          eyebrow="Legal"
          title="Privacy"
          subtitle="Draft for review. This describes the account data CastIQ stores to run the product."
        />
        <article className="space-y-6 text-sm leading-relaxed text-castiq-muted">
          <section>
            <h2 className="text-base font-semibold text-castiq-white">Account data</h2>
            <p className="mt-2">
              When you sign in, CastIQ stores your account identifier, email, display name, photo if the sign-in provider supplies one, role, favorite lakes, alert preferences, and the reports tied to your account.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-castiq-white">Reports</h2>
            <p className="mt-2">
              Public reports can be read by other signed-in users. Reports you keep private are limited to your account and administrators. Do not put information in a report that you do not want stored.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-castiq-white">Location</h2>
            <p className="mt-2">
              If you allow location access, the app uses it to center the map. CastIQ does not describe that permission as continuous background tracking.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-castiq-white">Guide data</h2>
            <p className="mt-2">
              Guide portal records, including API keys, are visible to that guide account and administrators. They are not part of the public guide directory.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-castiq-white">What this draft does not claim</h2>
            <p className="mt-2">
              This draft does not describe selling personal information, and it does not promise a specific retention or deletion process beyond what the product currently does. A reviewed policy should replace this page before it is treated as final.
            </p>
          </section>
        </article>
        <div className="mt-8">
          <SourceFooter>This page is a product draft and still needs legal review.</SourceFooter>
        </div>
      </PageContainer>
    </>
  );
}
