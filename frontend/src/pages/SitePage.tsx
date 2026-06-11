import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ExternalLink, Power, Trash2, Eye, AlertCircle, Plus, Check, X } from 'lucide-react';
import { ConfirmModal } from '../lib/ConfirmModal.tsx';
import { useApi } from '../lib/api.ts';
import { useSites } from '../lib/SitesProvider.tsx';
import { usePollData } from '../lib/usePollData.ts';
import { calcUptimePct, getAccentStyle } from '../lib/utils.ts';
import { extractAccentColor } from '../lib/extractColor.ts';
import { useToast } from '../lib/ToastContext.tsx';
import { UptimeChart } from '../components/UptimeChart.tsx';
import { ActivityChart } from '../components/ActivityChart.tsx';
import { VersionPanel } from '../components/VersionPanel.tsx';
import { Tooltip } from '../components/Tooltip.tsx';
import { BackButton } from '../components/BackButton.tsx';
import { Section } from '../components/Section.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import { SLOT_MS } from '../lib/types.ts';
import type { Site, Version, Slot, Visitor, UptimeSlot, TimeRange, UptimeRange } from '../lib/types.ts';

const ACCENT_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];

function SitePage() {
  const { domain } = useParams<{ domain: string }>();
  const { apiFetch, apiBase, host, protocol } = useApi();
  const { refreshSites } = useSites();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [site, setSite] = useState<Site | null>(null);
  const [siteLoading, setSiteLoading] = useState(true);
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
  const [allowDeletion, setAllowDeletion] = useState(false);
  const [customDomains, setCustomDomains] = useState<{ domain: string; verified: boolean }[]>([]);
  const [customDomainsLoading, setCustomDomainsLoading] = useState(false);
  const [newCustomDomain, setNewCustomDomain] = useState('');
  const [addingCustomDomain, setAddingCustomDomain] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [showDnsInstructions, setShowDnsInstructions] = useState(false);
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
      setSiteLoading(false);
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
      const savedAccent = typeof data.accent === 'string' ? data.accent : null;

      if (savedAccent) {
        setAccent(savedAccent);
      } else {
        // Auto-extract accent from icon if not set
        const iconUrl = `${apiBase}/sites/${domain}/icon`;
        const extractedColor = await extractAccentColor(iconUrl);
        if (extractedColor) {
          setAccent(extractedColor);
          // Optionally save it to the server
          try {
            await apiFetch(`/sites/${domain}/meta`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accent: extractedColor }),
            });
          } catch {
            // Silent fail - still use the extracted color locally
          }
        }
      }
    } catch {
      // non-critical
    }
  }, [domain, apiBase]);

  const saveAccent = async (color: string | null) => {
    setAccent(color);
    try {
      await apiFetch(`/sites/${domain}/meta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accent: color }),
      });
      showToast('Accent color updated', true);
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

  const loadCustomDomains = useCallback(async () => {
    setCustomDomainsLoading(true);
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains`);
      const data = await res.json();
      setCustomDomains((data.customDomains as { domain: string; verified: boolean }[]) ?? []);
    } catch {
      // non-critical
    } finally {
      setCustomDomainsLoading(false);
    }
  }, [domain]);

  const loadVerificationToken = useCallback(async () => {
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains/token`);
      const data = await res.json();
      setVerificationToken(data.token);
    } catch {
      // non-critical
    }
  }, [domain]);

  const addCustomDomain = async () => {
    if (!newCustomDomain.trim()) return;
    setAddingCustomDomain(true);
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain: newCustomDomain.trim() }),
      });
      if (res.ok) {
        await loadCustomDomains();
        setNewCustomDomain('');
        showToast('Custom domain added', true);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to add custom domain', false);
      }
    } catch {
      showToast('Failed to add custom domain', false);
    } finally {
      setAddingCustomDomain(false);
    }
  };

  const verifyCustomDomain = async (customDomain: string) => {
    setVerifyingDomain(customDomain);
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains/${customDomain}/verify`, {
        method: 'POST',
      });
      if (res.ok) {
        await loadCustomDomains();
        showToast('Custom domain verified', true);
      } else {
        const data = await res.json();
        showToast(data.message || 'Verification failed', false);
      }
    } catch {
      showToast('Verification failed', false);
    } finally {
      setVerifyingDomain(null);
    }
  };

  const deleteCustomDomain = async (customDomain: string) => {
    setDeletingDomain(customDomain);
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains/${customDomain}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadCustomDomains();
        showToast('Custom domain removed', true);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to remove custom domain', false);
      }
    } catch {
      showToast('Failed to remove custom domain', false);
    } finally {
      setDeletingDomain(null);
    }
  };

  // Initial data load
  useEffect(() => {
    loadSite();
    loadVersions();
    loadMeta();
    loadCustomDomains();
    loadVerificationToken();
  }, [loadSite, loadVersions, loadMeta, loadCustomDomains, loadVerificationToken]);

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

        <Section
          id="overview"
          icon={SECTIONS.find((s) => s.id === 'overview')?.icon!}
          title={SECTIONS.find((s) => s.id === 'overview')?.label!}
        >
          {siteLoading ? (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0 mt-0.5">
                <button
                  type="button"
                  disabled
                  className="h-8 w-24 bg-stone-100 dark:bg-stone-800 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <span className="invisible">Enable</span>
                </button>
              </div>
            </div>
          ) : site ? (
            (() => {
              const initial = site.domain[0].toUpperCase();
              const accentStyle = getAccentStyle(accent, site.enabled);
              return (
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
                        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {site.domain}
                        </h1>
                        <span
                          className={`shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            !site.enabled
                              ? 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                              : accentStyle
                                ? ''
                                : 'bg-purple-200 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                          }`}
                          style={
                            accentStyle ? { backgroundColor: accentStyle.bg, color: accentStyle.color } : undefined
                          }
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
                    <button
                      type="button"
                      onClick={() => setConfirmAction(site.enabled ? 'disable' : 'enable')}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer disabled:cursor-auto disabled:opacity-50 w-24 justify-center bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                    >
                      <Power className="w-3.5 h-3.5 shrink-0" />
                      <span className="w-14 text-center">{site.enabled ? 'Disable' : 'Enable'}</span>
                    </button>
                  </div>
                </div>
              );
            })()
          ) : null}
        </Section>

        {/* Accent color section */}
        <Section
          id="accent"
          icon={SECTIONS.find((s) => s.id === 'accent')?.icon!}
          title={SECTIONS.find((s) => s.id === 'accent')?.label!}
        >
          <div className="flex items-center justify-between">
            {siteLoading ? (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
                  style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
                />
                <div
                  className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
                  style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
                />
                <div
                  className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
                  style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
                />
                <div
                  className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
                  style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
                />
                <div
                  className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
                  style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
                />
                <div
                  className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
                  style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
                />
                <div
                  className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
                  style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
                />
                <div
                  className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
                  style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {ACCENT_COLORS.map((color) => (
                  <Tooltip key={color} content={color}>
                    <button
                      type="button"
                      onClick={() => saveAccent(accent === color ? null : color)}
                      className="w-4 h-4 rounded-full cursor-pointer"
                      style={{
                        backgroundColor: color,
                        outline: accent === color ? `2px solid ${color}` : '2px solid transparent',
                        outlineOffset: '2px',
                      }}
                    />
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Custom Domains section */}
        <Section
          id="custom-domains"
          icon={SECTIONS.find((s) => s.id === 'custom-domains')?.icon!}
          title={SECTIONS.find((s) => s.id === 'custom-domains')?.label!}
        >
          <div className="space-y-4">
            {/* DNS Instructions */}
            {verificationToken && (
              <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowDnsInstructions(!showDnsInstructions)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-xs font-medium text-stone-700 dark:text-stone-300">DNS Setup Instructions</span>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {showDnsInstructions ? 'Hide' : 'Show'}
                  </span>
                </button>
                {showDnsInstructions && (
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2 rounded bg-stone-100 dark:bg-stone-800">
                      <p className="font-medium text-stone-700 dark:text-stone-300 mb-1">
                        TXT Record (for verification):
                      </p>
                      <code className="block text-stone-600 dark:text-stone-400 break-all">
                        _nohonu.{newCustomDomain || 'example.com'} → {verificationToken}
                      </code>
                    </div>
                    <div className="p-2 rounded bg-stone-100 dark:bg-stone-800">
                      <p className="font-medium text-stone-700 dark:text-stone-300 mb-1">CNAME Record (or A Record):</p>
                      <code className="block text-stone-600 dark:text-stone-400">
                        {newCustomDomain || 'example.com'} → {host}
                      </code>
                      <p className="mt-1 text-stone-500 dark:text-stone-500">Or A record to your server IP</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add domain input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCustomDomain}
                onChange={(e) => setNewCustomDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={addingCustomDomain}
              />
              <button
                type="button"
                onClick={addCustomDomain}
                disabled={addingCustomDomain || !newCustomDomain.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:cursor-auto disabled:opacity-50 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {/* Custom domains list */}
            {customDomainsLoading ? (
              <div className="space-y-2">
                <div className="h-10 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
                <div className="h-10 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
              </div>
            ) : customDomains.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-stone-500">No custom domains configured</p>
            ) : (
              <div className="space-y-2">
                {customDomains.map((cd) => (
                  <div
                    key={cd.domain}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-stone-700 dark:text-stone-300 truncate">{cd.domain}</span>
                      <span
                        className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          cd.verified
                            ? 'bg-green-200 dark:bg-green-900/30 text-green-600 dark:text-green-300'
                            : 'bg-amber-200 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300'
                        }`}
                      >
                        {cd.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!cd.verified && (
                        <button
                          type="button"
                          onClick={() => verifyCustomDomain(cd.domain)}
                          disabled={verifyingDomain === cd.domain}
                          className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50"
                          title="Verify domain"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteCustomDomain(cd.domain)}
                        disabled={deletingDomain === cd.domain}
                        className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                        title="Remove domain"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section
          id="activity"
          icon={SECTIONS.find((s) => s.id === 'activity')?.icon!}
          title={SECTIONS.find((s) => s.id === 'activity')?.label!}
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

        <Section
          id="uptime"
          icon={SECTIONS.find((s) => s.id === 'uptime')?.icon!}
          title={SECTIONS.find((s) => s.id === 'uptime')?.label!}
          container={false}
        >
          <UptimeChart uptime={uptimeData} range={uptimeRange} onRangeChange={setUptimeRange} accent={accent} />
        </Section>

        <Section
          id="versions"
          icon={SECTIONS.find((s) => s.id === 'versions')?.icon!}
          title={SECTIONS.find((s) => s.id === 'versions')?.label!}
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

        <Section
          id="actions"
          icon={SECTIONS.find((s) => s.id === 'actions')?.icon!}
          title={SECTIONS.find((s) => s.id === 'actions')?.label!}
          danger
        >
          <div>
            <div className="text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span>
                {site?.enabled
                  ? 'You must disable the site before deleting it.'
                  : 'Enable the toggle to access deletion options.'}
              </span>
              <label htmlFor="allowDeletion" className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-stone-700 dark:text-stone-300">Enable</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    id="allowDeletion"
                    checked={allowDeletion}
                    onChange={(e) => setAllowDeletion(e.target.checked)}
                    disabled={actionLoading || !site}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-red-200 dark:bg-red-900/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-red-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </div>
              </label>
            </div>
          </div>

          <div
            className={`border-t border-stone-200 dark:border-stone-800 pt-4 mt-4 ${!allowDeletion ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-stone-700 dark:text-stone-300">
                  Deleting a site is permanent and cannot be undone. All data, including versions and statistics, will
                  be permanently removed.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmAction('delete')}
                  disabled={actionLoading || !site || site.enabled || !allowDeletion}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer disabled:cursor-auto disabled:opacity-50 bg-stone-100 dark:bg-stone-800 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-400 dark:hover:text-white shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Site Permanently
                </button>
              </div>
              {site?.enabled && (
                <p className="text-xs text-stone-700 dark:text-stone-300 mt-2">Site must be disabled first</p>
              )}
            </div>
          </div>
        </Section>

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
