import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Layout, BarChart3, Globe, Layers, Settings } from 'lucide-react';
import { ConfirmModal } from '../lib/ConfirmModal.tsx';
import { useApi } from '../lib/api.ts';
import { useSites } from '../lib/SitesProvider.tsx';
import { calcUptimePct } from '../lib/utils.ts';
import { useToast } from '../lib/ToastContext.tsx';
import { useAccentColor } from '../lib/AccentColorProvider.tsx';
import { useFont, getFontFamily } from '../lib/FontProvider.tsx';
import { UptimeChart } from '../components/UptimeChart.tsx';
import { ActivityChart } from '../components/ActivityChart.tsx';
import { VersionPanel } from '../components/VersionPanel.tsx';
import { CustomDomainsSection } from '../components/CustomDomainsSection.tsx';
import { DangerZoneSection } from '../components/DangerZoneSection.tsx';
import { AccentSection } from '../components/AccentSection.tsx';
import { OverviewSection } from '../components/OverviewSection.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import { useSiteData } from '../hooks/useSiteData.ts';
import { SLOT_MS, type TimeRange } from '../lib/types.ts';
import { Footer } from '../components/Footer.tsx';

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

function SitePage() {
  const { domain, sitename, username } = useParams<{ domain?: string; sitename?: string; username?: string }>();
  const actualDomain = sitename || domain;
  const { apiFetch, apiBase, host, protocol } = useApi();
  const { refreshSites } = useSites();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { getAccentColorValues } = useAccentColor();
  const { font } = useFont();
  const accentColorValues = getAccentColorValues();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'domains' | 'versions' | 'settings'>(
    'overview'
  );

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

    try {
      if (confirmAction === 'delete') {
        await apiFetch(`/sites/${site.domain}`, { method: 'DELETE' });
        showToast('Site deleted', true);
        navigate('/');
        return;
      }
      await apiFetch(`/sites/${site.domain}/toggle`, { method: 'PATCH' });
      await loadSite();
      showToast(`Site ${site.enabled ? 'disabled' : 'enabled'}`, true);
    } catch {
      // Silent fail
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleActivate = async () => {
    if (!site || !versionModal) return;
    const { timestamp } = versionModal;
    setVersionModal(null);
    setActivating(timestamp);
    try {
      const res = await apiFetch(`/sites/${site.domain}/versions/${timestamp}/activate`, { method: 'POST' });
      if (res.ok) {
        await loadSite();
        await loadVersions();
        showToast('Version activated', true);
      }
    } catch {
      // Silent fail
    } finally {
      setActivating(null);
    }
  };

  const handleDeleteVersion = async () => {
    if (!site || !versionModal) return;
    setDeletingVersion(versionModal.timestamp);
    try {
      const res = await apiFetch(`/sites/${site.domain}/versions/${versionModal.timestamp}`, { method: 'DELETE' });
      if (res.ok) {
        await loadVersions();
        showToast('Version deleted', true);
      }
    } catch {
      // Silent fail
    } finally {
      setDeletingVersion(null);
      setVersionModal(null);
    }
  };

  const downloadVersion = async (timestamp: number) => {
    if (!site) return;
    try {
      const res = await apiFetch(`/sites/${site.domain}/versions/${timestamp}/download`);
      if (!res.ok) {
        showToast('Download failed', false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${site.domain}-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showToast('Download failed', false);
    }
  };

  const siteUrl = `${protocol}//${site?.domain}.${host}`;

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
            <h1
              className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1"
              style={{ fontFamily: getFontFamily(font) }}
            >
              {site?.domain}
            </h1>
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
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Layout className="w-4 h-4" />
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('domains')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'domains'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            Domains
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'versions'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            Versions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
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
        <section className="max-w-7xl mx-auto px-6 py-8">
          <CustomDomainsSection domain={domain!} />
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
      <Footer />
    </section>
  );
}

export default SitePage;
