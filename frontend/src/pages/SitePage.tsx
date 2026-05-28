import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Power, Trash2, Loader2, AlertCircle, Eye } from 'lucide-react';
import { ConfirmModal } from '../lib/ConfirmModal.tsx';
import { useApi } from '../lib/api.ts';
import { usePollData } from '../lib/usePollData.ts';
import { calcUptimePct, getAccentStyle } from '../lib/utils.ts';
import { UptimeChart } from '../components/UptimeChart.tsx';
import { ActivityChart } from '../components/ActivityChart.tsx';
import { VersionPanel } from '../components/VersionPanel.tsx';
import { SLOT_MS } from '../lib/types.ts';
import type { Site, Version, Slot, Visitor, UptimeSlot, TimeRange, UptimeRange } from '../lib/types.ts';

const ACCENT_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];

function SitePage() {
  const { domain } = useParams<{ domain: string }>();
  const { apiFetch, apiBase, host, protocol } = useApi();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'enable' | 'disable' | null>(null);
  const [stats, setStats] = useState<Slot[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsRange, setStatsRange] = useState<TimeRange>(60);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [uptimeData, setUptimeData] = useState<UptimeSlot[]>([]);
  const [uptimeRange, setUptimeRange] = useState<UptimeRange>(60);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [activating, setActivating] = useState<number | null>(null);
  const [deletingVersion, setDeletingVersion] = useState<number | null>(null);
  const [versionModal, setVersionModal] = useState<{
    type: 'delete' | 'activate';
    timestamp: number;
    label: string;
  } | null>(null);
  const [iconError, setIconError] = useState(false);
  const [accent, setAccent] = useState<string | null>(null);
  const uptimeMountedRef = useRef(false);

  const loadSite = useCallback(async () => {
    try {
      const res = await apiFetch(`/sites/${domain}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setSite(data as Site);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [domain]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await apiFetch(`/sites/${domain}/stats?slots=${statsRange}`);
      const data = await res.json();
      setStats((data.stats as Slot[]) ?? []);
    } catch {
      // non-critical
    } finally {
      setStatsLoading(false);
    }
  }, [domain, statsRange]);

  const loadVisitors = useCallback(async () => {
    try {
      const res = await apiFetch(`/sites/${domain}/visitors`);
      const data = await res.json();
      setVisitors((data.visitors as Visitor[]) ?? []);
    } catch {
      // non-critical
    }
  }, [domain]);

  const loadVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      const res = await apiFetch(`/sites/${domain}/versions`);
      const data = await res.json();
      setVersions((data.versions as Version[]) ?? []);
      setCurrentVersion(data.current as number | null);
    } catch {
      // non-critical
    } finally {
      setVersionsLoading(false);
    }
  }, [domain]);

  const loadMeta = useCallback(async () => {
    try {
      const res = await apiFetch(`/sites/${domain}/meta`);
      const data = await res.json();
      setAccent(typeof data.accent === 'string' ? data.accent : null);
    } catch {
      // non-critical
    }
  }, [domain]);

  const saveAccent = async (color: string | null) => {
    setAccent(color);
    try {
      await apiFetch(`/sites/${domain}/meta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accent: color }),
      });
    } catch {
      // non-critical
    }
  };

  const loadUptime = useCallback(
    async (slots: number) => {
      try {
        const res = await apiFetch(`/sites/${domain}/uptime?slots=${slots}`);
        const data = await res.json();
        setUptimeData((data.uptime as UptimeSlot[]) ?? []);
      } catch {
        // non-critical
      }
    },
    [domain]
  );

  // Initial data load
  useEffect(() => {
    loadSite();
    loadVersions();
    loadMeta();
  }, [loadSite, loadVersions, loadMeta]);

  // Reload uptime only when range changes (not on initial mount — usePollData handles that)
  useEffect(() => {
    if (!uptimeMountedRef.current) {
      uptimeMountedRef.current = true;
      return;
    }
    loadUptime(uptimeRange);
  }, [loadUptime, uptimeRange]);

  // Poll stats and visitors every minute
  usePollData(
    () => {
      loadStats();
      loadVisitors();
      loadUptime(uptimeRange);
    },
    SLOT_MS,
    true
  );

  const handleConfirm = async () => {
    if (!confirmAction || !site) return;
    setActionLoading(true);

    try {
      if (confirmAction === 'delete') {
        await apiFetch(`/sites/${site.domain}`, { method: 'DELETE' });
        navigate('/');
        return;
      }
      await apiFetch(`/sites/${site.domain}/toggle`, { method: 'PATCH' });
      await loadSite();
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
      if (res.ok) await loadVersions();
    } catch {
      // Silent fail
    } finally {
      setDeletingVersion(null);
      setVersionModal(null);
    }
  };

  const downloadVersion = async (timestamp: number) => {
    if (!site) return;
    const res = await apiFetch(`/sites/${site.domain}/versions/${timestamp}/download`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.domain}-${timestamp}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const siteUrl = `${protocol}//${site?.domain}.${host}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-stone-400 dark:text-stone-600 animate-spin" />
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="text-center py-24">
        <div className="w-12 h-12 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6 text-purple-500 dark:text-purple-400" />
        </div>
        <p className="text-stone-700 dark:text-stone-300 text-sm font-medium">Site not found</p>
        <Link
          to="/"
          className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 mt-2 inline-block"
        >
          Back to sites
        </Link>
      </div>
    );
  }

  const initial = site.domain[0].toUpperCase();
  const totalHits = stats.reduce((a, b) => a + b.count, 0);
  const uptimePct = calcUptimePct(uptimeData);
  const accentStyle = getAccentStyle(accent, site.enabled);

  return (
    <section>
      <div className="mb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Sites
        </Link>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold select-none overflow-hidden ${
                site.enabled
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600'
              }`}
            >
              {!iconError ? (
                <img
                  src={`${apiBase}/sites/${site.domain}/icon`}
                  alt=""
                  className="w-6 h-6 object-contain"
                  onError={() => setIconError(true)}
                />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100 truncate">{site.domain}</h1>
                <span
                  className={`shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    !site.enabled
                      ? 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                      : accentStyle
                        ? ''
                        : 'bg-purple-200 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                  }`}
                  style={accentStyle ? { backgroundColor: accentStyle.bg, color: accentStyle.color } : undefined}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${!site.enabled ? 'bg-stone-400 dark:bg-stone-500' : accentStyle ? '' : 'bg-purple-400'}`}
                    style={accentStyle ? { backgroundColor: accentStyle.color } : undefined}
                  />
                  {site.enabled ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => !site.enabled && e.preventDefault()}
                  className={`flex items-center gap-1 text-xs ${
                    site.enabled
                      ? 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                      : 'text-stone-300 dark:text-stone-600 pointer-events-none'
                  }`}
                >
                  {site.domain}.{host}
                  {site.enabled && <ExternalLink className="w-3 h-3" />}
                </a>
                {totalHits > 0 && (
                  <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                    <Eye className="w-3 h-3" />
                    {totalHits.toLocaleString()} views
                  </span>
                )}
                {uptimePct !== null && (
                  <span
                    className={`text-xs font-medium ${
                      uptimePct < 90
                        ? 'text-stone-400 dark:text-stone-500'
                        : accentStyle
                          ? ''
                          : 'text-purple-400 dark:text-purple-300'
                    }`}
                    style={uptimePct >= 90 && accentStyle ? { color: accentStyle.color } : undefined}
                  >
                    {uptimePct}% uptime
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0 mt-0.5">
            {/* Accent swatches */}
            <div className="flex items-center gap-1.5">
              {ACCENT_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => saveAccent(accent === color ? null : color)}
                  className="w-4 h-4 rounded-full transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: color,
                    outline: accent === color ? `2px solid ${color}` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                  title={color}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setConfirmAction(site.enabled ? 'disable' : 'enable')}
              disabled={actionLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                site.enabled
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {site.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <ActivityChart
          stats={stats}
          visitors={visitors}
          onReload={loadStats}
          reloading={statsLoading}
          range={statsRange}
          onRangeChange={setStatsRange}
        />
      )}

      <UptimeChart uptime={uptimeData} range={uptimeRange} onRangeChange={setUptimeRange} accent={accent} />

      <VersionPanel
        domain={site.domain}
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
        }}
      />

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 mt-3">
        <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setConfirmAction('delete')}
            disabled={actionLoading}
            className="flex items-center gap-2 px-3 py-2 text-purple-500 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        action={confirmAction ?? 'delete'}
        domain={site.domain}
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
