import { Link } from 'react-router-dom';
import { PageContainer, PageHeader } from '../components/ui/Chrome';
import { usePageTitle } from '../hooks/usePageTitle';

export function About() {
  usePageTitle('About');
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        eyebrow="CastIQ"
        title="Minnesota lake intelligence"
        subtitle="Look up a lake, read dated fishing reports, and check state survey information before you go."
      />
      <div className="space-y-4 text-sm text-castiq-muted">
        <p>
          CastIQ is built for Minnesota anglers. Search covers the Minnesota DNR lake catalog, with county and nearby town so lakes that share a name can be told apart. Reports and agency surveys stay labeled with their source and date.
        </p>
        <p>
          {/* TODO: Replace with partner-approved founder and team copy. Do not invent biographies. */}
          Founder and team details will be added after the partners approve that copy.
        </p>
        <Link to="/pricing" className="ciq-btn-primary inline-flex">
          See plans
        </Link>
      </div>
    </PageContainer>
  );
}
