import { createFileRoute } from '@tanstack/react-router';
import { OverviewSection } from '../components/OverviewSection.tsx';
import { useSiteShellContext } from '../hooks/useSiteShellContext.ts';

function Overview() {
  const {
    site,
    username,
    siteLoading,
    actionLoading,
    setConfirmAction,
    siteUrl,
    host,
    totalHits,
    uptimePct,
    isPublicView,
  } = useSiteShellContext();

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <OverviewSection
        site={site}
        username={username}
        siteLoading={siteLoading}
        actionLoading={actionLoading}
        onToggle={() => setConfirmAction(site?.enabled ? 'disable' : 'enable')}
        siteUrl={siteUrl}
        host={host}
        totalHits={totalHits}
        uptimePct={uptimePct}
        isReadOnly={isPublicView}
      />
    </section>
  );
}

export const Route = createFileRoute('/u/$username/$siteId/')({
  component: Overview,
});
