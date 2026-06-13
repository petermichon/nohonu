import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ConfirmModal } from '../lib/ConfirmModal.tsx';
import { useApi } from '../lib/api.ts';
import { useSites } from '../lib/SitesProvider.tsx';
import { calcUptimePct } from '../lib/utils.ts';
import { useToast } from '../lib/ToastContext.tsx';
import { UptimeChart } from '../components/UptimeChart.tsx';
import { ActivityChart } from '../components/ActivityChart.tsx';
import { VersionPanel } from '../components/VersionPanel.tsx';
import { BackButton } from '../components/BackButton.tsx';
import { Section } from '../components/Section.tsx';
import { CustomDomainsSection } from '../components/CustomDomainsSection.tsx';
import { DangerZoneSection } from '../components/DangerZoneSection.tsx';
import { AccentSection } from '../components/AccentSection.tsx';
import { OverviewSection } from '../components/OverviewSection.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import { useSiteData } from '../hooks/useSiteData.ts';

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

function SitePage() {
  const { domain } = useParams<{ domain: string }>();
  const { apiFetch, apiBase, host, protocol } = useApi();
  const { refreshSites } = useSites();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    site,
    siteLoading,
    notFound,
    stats,
    statsLoading,
    statsRange,
    setStatsRange,
    visitors,
    uptimeData,
    uptimeRange,
    setUptimeRange,
    accent,
    saveAccent,
    versions,
    versionsLoading,
    currentVersion,
    loadSite,
    loadStats,
    loadVersions,
  } = useSiteData(domain!);

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
        <p className="text-stone-700 dark:text-stone-300 text-sm font-medium">Site not found</p>
        <Link
          to="/sites"
          className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 mt-2 inline-block"
        >
          Back to sites
        </Link>
      </div>
    );
  }

  const totalHits = stats.reduce((a, b) => a + b.count, 0);
  const uptimePct = calcUptimePct(uptimeData);

  return (
    <section className="flex gap-6 relative">
      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <BackButton to="/sites" label="Sites" />
        </div>

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

        <CustomDomainsSection domain={domain!} />

        <Section
          id="activity"
          icon={SECTION_MAP['activity'].icon}
          title={SECTION_MAP['activity'].label}
          container={false}
        >
          <ActivityChart
            stats={stats}
            visitors={visitors}
            onReload={loadStats}
            reloading={statsLoading}
            range={statsRange}
            onRangeChange={setStatsRange}
          />
        </Section>

        <Section id="uptime" icon={SECTION_MAP['uptime'].icon} title={SECTION_MAP['uptime'].label} container={false}>
          <UptimeChart uptime={uptimeData} range={uptimeRange} onRangeChange={setUptimeRange} accent={accent} />
        </Section>

        <Section
          id="versions"
          icon={SECTION_MAP['versions'].icon}
          title={SECTION_MAP['versions'].label}
          container={false}
        >
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
        </Section>

        <DangerZoneSection
          site={site}
          actionLoading={actionLoading}
          onRequestDelete={() => setConfirmAction('delete')}
        />

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
      </div>
    </section>
  );
}

export default SitePage;
