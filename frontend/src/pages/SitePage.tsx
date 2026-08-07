import { useState, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal.tsx';
import { useApi } from '../hooks/api/useApi.ts';
import { useSites } from '../hooks/api/useSites.ts';
import { useConnection } from '../providers/ConnectionProvider.tsx';
import { useToast } from '../providers/ToastContext.tsx';
import { calcUptimePct } from '../lib/utils.ts';
import { UptimeChart } from '../components/UptimeChart.tsx';
import { ActivityChart } from '../components/ActivityChart.tsx';
import { VersionPanel } from '../components/VersionPanel.tsx';
import { CustomDomainsSection } from '../components/CustomDomainsSection.tsx';
import { DangerZoneSection } from '../components/DangerZoneSection.tsx';
import { SubdomainSection } from '../components/SubdomainSection.tsx';
import { OverviewSection } from '../components/OverviewSection.tsx';
import { SiteProfileSection } from '../components/SiteProfileSection.tsx';
import { SiteHeader } from '../components/sitepage/SiteHeader.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import { useSiteData } from '../hooks/useSiteData.ts';
import { useSiteActions } from '../hooks/useSiteActions.ts';
import { SLOT_MS, type TimeRange } from '../lib/types.ts';

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

function SitePage() {
  const location = useLocation();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const hasSection = pathSegments.length >= 4;

  const username = pathSegments[1] as string;
  const sitename = pathSegments[2] as string;
  const section = pathSegments[3] as string | undefined;

  const actualUsername = username;
  const actualSitename = sitename;
  const actualSection = hasSection ? section : undefined;

  const actualDomain = actualSitename;
  const { host, hostWithPort, protocol } = useApi();
  const { refreshSites } = useSites();
  const { username: loggedInUsername } = useConnection();
  const { showToast } = useToast();
  const activeTab = (actualSection || 'overview') as 'overview' | 'analytics' | 'domains' | 'versions' | 'settings';

  const isPublicView = !!actualUsername && actualUsername !== loggedInUsername;

  const {
    site,
    siteLoading,
    notFound,
    stats,
    statsLoading,
    setStatsRange,
    visitors,
    uptimeData,
    uptimeAllData,
    uptimeLoading,
    setUptimeRange,
    versions,
    versionsLoading,
    currentVersion,
    loadSite,
    loadStats,
    loadUptime,
    loadVersions,
  } = useSiteData(actualDomain!, actualUsername, isPublicView);

  const actions = useSiteActions({ site, username, loadSite, loadVersions });

  const [now, setNow] = useState(() => Math.floor(Date.now() / SLOT_MS));
  const [globalRange, setGlobalRange] = useState<TimeRange>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / SLOT_MS));
    }, SLOT_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStatsRange(globalRange);
    setUptimeRange(globalRange);
  }, [globalRange, setStatsRange, setUptimeRange]);

  const subdomainBase = site?.subdomainBase || hostWithPort;
  const siteUrl = site?.subdomain
    ? `${protocol}//${site.subdomain}.${subdomainBase}`
    : `${protocol}//${site?.domain}.${subdomainBase}`;

  if (notFound) {
    return (
      <div className="text-center py-24">
        <div className="w-12 h-12 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6 text-purple-500 dark:text-purple-400" />
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Site not found</p>
        <Link
          to="/"
          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 mt-2 inline-block"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const totalHits = stats.reduce((a, b) => a + b.count, 0);
  const uptimePct = calcUptimePct(uptimeData);

  return (
    <section className="mb-12">
      <SiteHeader site={site} username={actualUsername || ''} activeTab={activeTab} isPublicView={isPublicView} />

      {activeTab === 'overview' && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <OverviewSection
            site={site}
            siteLoading={siteLoading}
            actionLoading={actions.actionLoading}
            onToggle={() => actions.setConfirmAction(site?.enabled ? 'disable' : 'enable')}
            siteUrl={siteUrl}
            host={host}
            totalHits={totalHits}
            uptimePct={uptimePct}
            isReadOnly={isPublicView}
          />
        </section>
      )}

      {activeTab === 'analytics' && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">
            {SECTION_MAP['activity'].label}
          </h2>
          <ActivityChart
            stats={stats}
            visitors={visitors}
            onReload={() => loadStats()}
            reloading={statsLoading}
            range={globalRange}
            onRangeChange={setGlobalRange}
            now={now}
          />
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3 mt-8">
            {SECTION_MAP['uptime'].label}
          </h2>
          <UptimeChart
            uptime={uptimeData}
            allUptime={uptimeAllData}
            range={globalRange}
            onRangeChange={setGlobalRange}
            onReload={() => loadUptime()}
            reloading={uptimeLoading}
            now={now}
          />
        </section>
      )}

      {activeTab === 'domains' && (
        <section className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
          <SubdomainSection subdomain={site?.subdomain || null} siteLoading={siteLoading} isReadOnly={isPublicView} />
          <CustomDomainsSection domain={actualDomain!} isReadOnly={isPublicView} />
        </section>
      )}

      {activeTab === 'versions' && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">
            {SECTION_MAP['versions'].label}
          </h2>
          <VersionPanel
            domain={site?.domain ?? ''}
            versions={versions}
            versionsLoading={versionsLoading}
            currentVersion={currentVersion}
            activating={actions.activating}
            deletingVersion={actions.deletingVersion}
            onActivate={(idx) => {
              const v = versions.find((v) => v.index === idx);
              actions.setVersionModal({
                type: 'activate',
                timestamp: idx,
                label: v ? new Date(v.createdAt).toLocaleString() : `#${idx}`,
              });
            }}
            onDelete={(idx) => {
              const v = versions.find((v) => v.index === idx);
              actions.setVersionModal({
                type: 'delete',
                timestamp: idx,
                label: v ? new Date(v.createdAt).toLocaleString() : `#${idx}`,
              });
            }}
            onDownload={actions.downloadVersion}
            onUploaded={async () => {
              await loadSite();
              await loadVersions();
              await refreshSites();
            }}
            onToast={(message, success = true) => {
              showToast(message, success);
            }}
            isReadOnly={isPublicView}
          />
        </section>
      )}

      {!isPublicView && activeTab === 'settings' && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <SiteProfileSection site={site} siteLoading={siteLoading} />
          <div className="border-t border-zinc-200 dark:border-zinc-800 my-8" />
          <DangerZoneSection
            site={site}
            actionLoading={actions.actionLoading}
            onRequestDelete={() => actions.setConfirmAction('delete')}
          />
        </section>
      )}

      <ConfirmModal
        isOpen={!!actions.confirmAction}
        onClose={() => actions.setConfirmAction(null)}
        onConfirm={actions.handleConfirm}
        action={actions.confirmAction ?? 'delete'}
        domain={site?.domain ?? ''}
        loading={actions.actionLoading}
      />
      <ConfirmModal
        isOpen={actions.versionModal?.type === 'activate'}
        onClose={() => actions.setVersionModal(null)}
        onConfirm={actions.handleActivate}
        action="activate-version"
        domain={actions.versionModal?.label ?? ''}
        loading={!!actions.activating}
      />
      <ConfirmModal
        isOpen={actions.versionModal?.type === 'delete'}
        onClose={() => actions.setVersionModal(null)}
        onConfirm={actions.handleDeleteVersion}
        action="delete-version"
        domain={actions.versionModal?.label ?? ''}
        loading={!!actions.deletingVersion}
      />
    </section>
  );
}

export default SitePage;
