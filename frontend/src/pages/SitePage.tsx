import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Layout, BarChart3, Globe, Layers, Settings } from 'lucide-react';
import { ConfirmModal } from '../lib/ConfirmModal.tsx';
import { useApi, useSites } from '../lib/api.ts';
import { calcUptimePct } from '../lib/utils.ts';
import { useToast } from '../lib/ToastContext.tsx';
import { useAccentColor } from '../lib/AccentColorProvider.tsx';
import { UptimeChart } from '../components/UptimeChart.tsx';
import { ActivityChart } from '../components/ActivityChart.tsx';
import { VersionPanel } from '../components/VersionPanel.tsx';
import { CustomDomainsSection } from '../components/CustomDomainsSection.tsx';
import { DangerZoneSection } from '../components/DangerZoneSection.tsx';
import { AccentSection } from '../components/AccentSection.tsx';
import { SubdomainSection } from '../components/SubdomainSection.tsx';
import { OverviewSection } from '../components/OverviewSection.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import { useSiteData } from '../hooks/useSiteData.ts';
import { SLOT_MS, type TimeRange } from '../lib/types.ts';

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

function SitePage() {
  const { domain, sitename, username, section } = useParams<{
    domain?: string;
    sitename?: string;
    username?: string;
    section?: string;
  }>();
  const actualDomain = sitename || domain;
  const { apiFetch, apiBase, host, protocol } = useApi();
  const { refreshSites } = useSites();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const activeTab = (section || 'overview') as 'overview' | 'analytics' | 'domains' | 'versions' | 'settings';

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
    accent,
    saveAccent,
    versions,
    versionsLoading,
    currentVersion,
    loadSite,
    loadStats,
    loadUptime,
    loadVersions,
  } = useSiteData(actualDomain!);

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'enable' | 'disable' | null>(null);
  const [activating, setActivating] = useState<number | null>(null);
  const [deletingVersion, setDeletingVersion] = useState<number | null>(null);
  const [versionModal, setVersionModal] = useState<{
    type: 'delete' | 'activate';
    timestamp: number;
    label: string;
  } | null>(null);
  const [iconError, setIconError] = useState(false);
  const [now, setNow] = useState(() => Math.floor(Date.now() / SLOT_MS));
  const [globalRange, setGlobalRange] = useState<TimeRange>(1);

  // Delete site mutation
  const deleteSiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      await apiFetch(`/sites/${domain}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      showToast('Site deleted', true);
      navigate('/');
    },
  });

  // Toggle site mutation
  const toggleSiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      await apiFetch(`/sites/${domain}/toggle`, { method: 'PATCH' });
    },
    onSuccess: async () => {
      await loadSite();
      showToast(`Site ${site?.enabled ? 'disabled' : 'enabled'}`, true);
    },
  });

  // Activate version mutation
  const activateVersionMutation = useMutation({
    mutationFn: async ({ domain, timestamp }: { domain: string; timestamp: number }) => {
      await apiFetch(`/sites/${domain}/versions/${timestamp}/activate`, { method: 'POST' });
    },
    onSuccess: async () => {
      await loadSite();
      await loadVersions();
      showToast('Version activated', true);
    },
  });

  // Delete version mutation
  const deleteVersionMutation = useMutation({
    mutationFn: async ({ domain, timestamp }: { domain: string; timestamp: number }) => {
      await apiFetch(`/sites/${domain}/versions/${timestamp}`, { method: 'DELETE' });
    },
    onSuccess: async () => {
      await loadVersions();
      showToast('Version deleted', true);
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

  const subdomainBase = site?.subdomainBase || host;
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
          to="/sites"
          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 mt-2 inline-block"
        >
          Back to sites
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
          <div
            className={`w-16 h-16 rounded-2xl ${accentColorValues.bgLight} flex items-center justify-center shrink-0`}
          >
            <Layout className={`w-8 h-8 ${accentColorValues.textDark}`} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">{site?.domain}</h1>
            {username ? (
              <Link
                to={`/u/${username}`}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                @{username}
              </Link>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Your site</p>
            )}
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            to={username ? `/u/${username}/${actualDomain}` : `/sites/${actualDomain}`}
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
            to={username ? `/u/${username}/${actualDomain}/analytics` : `/sites/${actualDomain}/analytics`}
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
            to={username ? `/u/${username}/${actualDomain}/domains` : `/sites/${actualDomain}/domains`}
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
            to={username ? `/u/${username}/${actualDomain}/versions` : `/sites/${actualDomain}/versions`}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'versions'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            Versions
          </Link>
          <Link
            to={username ? `/u/${username}/${actualDomain}/settings` : `/sites/${actualDomain}/settings`}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>
      </header>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <OverviewSection
            site={site}
            siteLoading={siteLoading}
            actionLoading={actionLoading}
            accent={accent}
            iconError={iconError}
            onIconError={() => setIconError(true)}
            onToggle={() => setConfirmAction(site?.enabled ? 'disable' : 'enable')}
            siteUrl={siteUrl}
            host={host}
            apiBase={apiBase}
            totalHits={totalHits}
            uptimePct={uptimePct}
          />
          <AccentSection
            accent={accent}
            siteLoading={siteLoading}
            onSaveAccent={(color) => {
              saveAccent(color);
              showToast('Accent color updated', true);
            }}
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
            accent={accent}
            now={now}
          />
        </section>
      )}

      {activeTab === 'domains' && (
        <section className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
          <SubdomainSection subdomain={site?.subdomain || null} siteLoading={siteLoading} />
          <CustomDomainsSection domain={actualDomain!} />
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
            accent={accent}
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
          />
        </section>
      )}

      {activeTab === 'settings' && (
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
