import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Layout, BarChart3, Globe, Layers, Settings } from 'lucide-react';
import { ConfirmModal } from '../lib/ConfirmModal.tsx';
import { useApi, useSites } from '../lib/api.ts';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { calcUptimePct } from '../lib/utils.ts';
import { useToast } from '../lib/ToastContext.tsx';
import { UptimeChart } from '../components/UptimeChart.tsx';
import { ActivityChart } from '../components/ActivityChart.tsx';
import { VersionPanel } from '../components/VersionPanel.tsx';
import { CustomDomainsSection } from '../components/CustomDomainsSection.tsx';
import { DangerZoneSection } from '../components/DangerZoneSection.tsx';
import { SubdomainSection } from '../components/SubdomainSection.tsx';
import { OverviewSection } from '../components/OverviewSection.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import { useSiteData } from '../hooks/useSiteData.ts';
import { SLOT_MS, type TimeRange } from '../lib/types.ts';

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

function SitePage() {
  const location = useLocation();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const hasSection = pathSegments.length >= 4; // /u/username/sitename/section

  const username = pathSegments[1] as string;
  const sitename = pathSegments[2] as string;
  const section = pathSegments[3] as string | undefined;

  const actualUsername = username;
  const actualSitename = sitename;
  const actualSection = hasSection ? section : undefined;

  const actualDomain = actualSitename;
  const { apiFetch, host, hostWithPort, protocol } = useApi();
  const { refreshSites } = useSites();
  const { username: loggedInUsername } = useConnection();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const activeTab = (actualSection || 'overview') as 'overview' | 'analytics' | 'domains' | 'versions' | 'settings';

  // Determine if this is a public view (viewing someone else's site)
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

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'enable' | 'disable' | null>(null);
  const [activating, setActivating] = useState<number | null>(null);
  const [deletingVersion, setDeletingVersion] = useState<number | null>(null);
  const [versionModal, setVersionModal] = useState<{
    type: 'delete' | 'activate';
    timestamp: number;
    label: string;
  } | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / SLOT_MS));
  const [globalRange, setGlobalRange] = useState<TimeRange>(1);

  // Delete site mutation
  const deleteSiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await apiFetch(`/sites/${domain}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete site');
      }
      return res.json();
    },
    onSuccess: () => {
      showToast('Site deleted', true);
      navigate({ to: '/' });
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  // Toggle site mutation
  const toggleSiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await apiFetch(`/sites/${domain}/toggle`, { method: 'PATCH' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle site');
      }
      return res.json();
    },
    onSuccess: async () => {
      await loadSite();
      showToast(`Site ${site?.enabled ? 'disabled' : 'enabled'}`, true);
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  // Activate version mutation
  const activateVersionMutation = useMutation({
    mutationFn: async ({ domain, timestamp }: { domain: string; timestamp: number }) => {
      const res = await apiFetch(`/sites/${domain}/versions/${timestamp}/activate`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to activate version');
      }
      return res.json();
    },
    onSuccess: async () => {
      await loadSite();
      await loadVersions();
      showToast('Version activated', true);
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  // Delete version mutation
  const deleteVersionMutation = useMutation({
    mutationFn: async ({ domain, timestamp }: { domain: string; timestamp: number }) => {
      const res = await apiFetch(`/sites/${domain}/versions/${timestamp}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete version');
      }
      return res.json();
    },
    onSuccess: async () => {
      await loadVersions();
      showToast('Version deleted', true);
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  // Download version mutation
  const downloadVersionMutation = useMutation({
    mutationFn: async ({ domain, timestamp }: { domain: string; timestamp: number }) => {
      const res = await apiFetch(`/sites/${domain}/versions/${timestamp}/download`);
      if (!res.ok) {
        throw new Error('Download failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${domain}-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: () => {
      showToast('Download failed', false);
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / SLOT_MS));
    }, SLOT_MS);
    return () => clearInterval(interval);
  }, []);

  // Sync global range to both charts
  useEffect(() => {
    setStatsRange(globalRange);
    setUptimeRange(globalRange);
  }, [globalRange, setStatsRange, setUptimeRange]);

  const handleConfirm = async () => {
    if (!confirmAction || !site) return;
    setActionLoading(true);

    if (confirmAction === 'delete') {
      deleteSiteMutation.mutate(site.domain, {
        onSettled: () => {
          setActionLoading(false);
          setConfirmAction(null);
        },
      });
    } else {
      toggleSiteMutation.mutate(site.domain, {
        onSettled: () => {
          setActionLoading(false);
          setConfirmAction(null);
        },
      });
    }
  };

  const handleActivate = async () => {
    if (!site || !versionModal) return;
    const { timestamp } = versionModal;
    setVersionModal(null);
    setActivating(timestamp);
    activateVersionMutation.mutate(
      { domain: site.domain, timestamp },
      {
        onSettled: () => setActivating(null),
      }
    );
  };

  const handleDeleteVersion = async () => {
    if (!site || !versionModal) return;
    setDeletingVersion(versionModal.timestamp);
    deleteVersionMutation.mutate(
      { domain: site.domain, timestamp: versionModal.timestamp },
      {
        onSettled: () => {
          setDeletingVersion(null);
          setVersionModal(null);
        },
      }
    );
  };

  const downloadVersion = (timestamp: number) => {
    if (!site) return;
    downloadVersionMutation.mutate({ domain: site.domain, timestamp });
  };

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
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
            <Layout className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">{site?.domain}</h1>
            {actualUsername ? (
              <Link
                to="/u/$username"
                params={{ username: actualUsername }}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                @{actualUsername}
              </Link>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Your site</p>
            )}
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            to="/u/$username/$sitename"
            params={{ username: actualUsername || '', sitename: actualDomain }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Layout className="w-4 h-4" />
            Overview
          </Link>
          <Link
            to="/u/$username/$sitename/$section"
            params={{ username: actualUsername || '', sitename: actualDomain, section: 'analytics' }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
          <Link
            to="/u/$username/$sitename/$section"
            params={{ username: actualUsername || '', sitename: actualDomain, section: 'domains' }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'domains'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            Domains
          </Link>
          <Link
            to="/u/$username/$sitename/$section"
            params={{ username: actualUsername || '', sitename: actualDomain, section: 'versions' }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'versions'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            Versions
          </Link>
          {!isPublicView && (
            <Link
              to="/u/$username/$sitename/$section"
              params={{ username: actualUsername || '', sitename: actualDomain, section: 'settings' }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          )}
        </nav>
      </header>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <OverviewSection
            site={site}
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
            activating={activating}
            deletingVersion={deletingVersion}
            onActivate={(idx) => {
              const v = versions.find((v) => v.index === idx);
              setVersionModal({
                type: 'activate',
                timestamp: idx,
                label: v ? new Date(v.createdAt).toLocaleString() : `#${idx}`,
              });
            }}
            onDelete={(idx) => {
              const v = versions.find((v) => v.index === idx);
              setVersionModal({
                type: 'delete',
                timestamp: idx,
                label: v ? new Date(v.createdAt).toLocaleString() : `#${idx}`,
              });
            }}
            onDownload={downloadVersion}
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
          <DangerZoneSection
            site={site}
            actionLoading={actionLoading}
            onRequestDelete={() => setConfirmAction('delete')}
          />
        </section>
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        action={confirmAction ?? 'delete'}
        domain={site?.domain ?? ''}
        loading={actionLoading}
      />
      <ConfirmModal
        isOpen={versionModal?.type === 'activate'}
        onClose={() => setVersionModal(null)}
        onConfirm={handleActivate}
        action="activate-version"
        domain={versionModal?.label ?? ''}
        loading={!!activating}
      />
      <ConfirmModal
        isOpen={versionModal?.type === 'delete'}
        onClose={() => setVersionModal(null)}
        onConfirm={handleDeleteVersion}
        action="delete-version"
        domain={versionModal?.label ?? ''}
        loading={!!deletingVersion}
      />
    </section>
  );
}

export default SitePage;
