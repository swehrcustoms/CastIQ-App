import { PageContainer, PageHeader, SourceFooter } from '../components/ui/Chrome';
import { usePageTitle } from '../hooks/usePageTitle';

export function Terms() {
  usePageTitle('Terms');
  return (
    <>
      {/* Legal review required before this copy is treated as binding. */}
      <PageContainer className="max-w-3xl">
        <PageHeader
          eyebrow="Legal"
          title="Terms of use"
          subtitle="Draft for review. These terms describe how CastIQ is offered today."
        />
        <article className="space-y-6 text-sm leading-relaxed text-castiq-muted">
          <section>
            <h2 className="text-base font-semibold text-castiq-white">The service</h2>
            <p className="mt-2">
              CastIQ provides fishing information drawn from lake records, surveys, weather, regulations, and reports that have been loaded into the product. It is an informational tool.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-castiq-white">Not a guarantee</h2>
            <p className="mt-2">
              Conditions, fish activity, ice, and regulations change. CastIQ does not guarantee that any report, map, contour, or recommendation is complete, current, or safe to rely on. Ice travel and boating decisions are yours. Confirm regulations with the managing agency.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-castiq-white">Accounts</h2>
            <p className="mt-2">
              You are responsible for the activity on your account. Guide tools are available only when access has been granted. Do not share API keys from the guide portal.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-castiq-white">Reports you submit</h2>
            <p className="mt-2">
              If you mark a report public, other signed-in anglers may read it. Private reports stay limited to you and administrators. You are responsible for the content you submit.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-castiq-white">AI summaries</h2>
            <p className="mt-2">
              Some text is generated from available records. Treat it as a summary, not a fact that was independently verified.
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
