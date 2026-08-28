import { createFileRoute, notFound, Link, useParams } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';
import { ActivityChart } from '../components/ActivityChart.tsx';
import { VersionPanel } from '../components/VersionPanel.tsx';
import { CustomDomainsSection } from '../components/CustomDomainsSection.tsx';
import { DangerZoneSection } from '../components/DangerZoneSection.tsx';
import { SubdomainSection } from '../components/SubdomainSection.tsx';
import { SiteProfileSection } from '../components/SiteProfileSection.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import { useSiteShellContext } from '../hooks/useSiteShellContext.ts';

const VALID_SECTIONS = ['analytics', 'domains', 'versions', 'settings'];

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

function SectionNotFound() {
  const { username, siteId } = useParams({ from: '/u/$username/sites/$siteId/$section' });

  return (
    <div className="text-center py-24">
      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
      </div>
      <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Section not found</p>
      <Link
        to="/u/$username/sites/$siteId"
        params={{ username, siteId }}
        className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 mt-2 inline-block"
      >
        Back to overview
      </Link>
    </div>
  );
}

function SectionPage() {
  const { section } = useParams({ from: '/u/$username/sites/$siteId/$section' });
  const ctx = useSiteShellContext();

  if (section === 'analytics') {
    return (
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">
          {SECTION_MAP['activity'].label}
        </h2>
        <ActivityChart
          stats={ctx.stats}
          onReload={() => ctx.loadStats()}
          reloading={ctx.statsLoading}
          range={ctx.globalRange}
          onRangeChange={ctx.setGlobalRange}
          now={ctx.now}
        />
      </section>
    );
  }

  if (section === 'domains') {
    return (
      <section className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
        <SubdomainSection
          username={ctx.username}
          siteId={ctx.siteId}
          subdomain={ctx.site?.subdomain || null}
          siteLoading={ctx.siteLoading}
          isReadOnly={ctx.isPublicView}
        />
        <CustomDomainsSection username={ctx.username} siteId={ctx.siteId} isReadOnly={ctx.isPublicView} />
      </section>
    );
  }

  if (section === 'versions') {
    return (
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">
          {SECTION_MAP['versions'].label}
        </h2>
        <VersionPanel
          username={ctx.username}
          siteId={ctx.siteId}
          versions={ctx.versions}
          versionsLoading={ctx.versionsLoading}
          currentVersion={ctx.currentVersion}
          activating={ctx.activating}
          deletingVersion={ctx.deletingVersion}
          onActivate={ctx.requestVersionActivate}
          onDelete={ctx.requestVersionDelete}
          onDownload={ctx.downloadVersion}
          onUploaded={ctx.onUploaded}
          onToast={ctx.onToast}
          isReadOnly={ctx.isPublicView}
        />
      </section>
    );
  }

  if (section === 'settings' && !ctx.isPublicView) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-8">
        <SiteProfileSection username={ctx.username} site={ctx.site} siteLoading={ctx.siteLoading} />
        <div className="border-t border-zinc-200 dark:border-zinc-800 my-8" />
        <DangerZoneSection
          site={ctx.site}
          actionLoading={ctx.actionLoading}
          onRequestDelete={() => ctx.setConfirmAction('delete')}
        />
      </section>
    );
  }

  return null;
}

export const Route = createFileRoute('/u/$username/sites/$siteId/$section')({
  beforeLoad: ({ params }) => {
    if (!VALID_SECTIONS.includes(params.section)) {
      throw notFound();
    }
  },
  component: SectionPage,
  notFoundComponent: SectionNotFound,
});
