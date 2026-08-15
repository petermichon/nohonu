import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useSites } from './api/useSites.ts';
import { useConnection } from './useConnection.ts';
import { useToast } from '../providers/ToastContext.tsx';
import { calcUptimePct } from '../lib/utils.ts';
import { useSiteData } from './useSiteData.ts';
import { useSiteActions } from './useSiteActions.ts';
import { SLOT_MS, type TimeRange, type Site, type Slot, type Visitor, type UptimeSlot, type Version, type SitePageTab } from '../lib/types.ts';
import { host, hostWithPort, protocol } from '../config.ts';

export interface SiteShellContext {
  site: Site | null;
  siteLoading: boolean;
  isPublicView: boolean;
  username: string;
  siteId: string;
  siteUrl: string;
  host: string;
  totalHits: number;
  uptimePct: number | null;
  now: number;
  globalRange: TimeRange;
  setGlobalRange: (range: TimeRange) => void;
  actionLoading: boolean;
  confirmAction: 'delete' | 'enable' | 'disable' | null;
  setConfirmAction: (action: 'delete' | 'enable' | 'disable' | null) => void;
  handleConfirm: () => Promise<void>;
  stats: Slot[];
  statsLoading: boolean;
  visitors: Visitor[];
  loadStats: () => Promise<void>;
  uptimeData: UptimeSlot[];
  uptimeAllData: UptimeSlot[];
  uptimeLoading: boolean;
  loadUptime: () => Promise<void>;
  versions: Version[];
  versionsLoading: boolean;
  currentVersion: number | null;
  activating: number | null;
  deletingVersion: number | null;
  requestVersionActivate: (index: number) => void;
  requestVersionDelete: (index: number) => void;
  downloadVersion: (timestamp: number) => void;
  onUploaded: () => Promise<void>;
  onToast: (message: string, success?: boolean) => void;
  versionModal: { type: 'delete' | 'activate'; timestamp: number; label: string } | null;
  setVersionModal: (modal: { type: 'delete' | 'activate'; timestamp: number; label: string } | null) => void;
  handleActivate: () => Promise<void>;
  handleDeleteVersion: () => Promise<void>;
}

export function useSiteShell(): SiteShellContext & { notFound: boolean; activeTab: SitePageTab } {
  const { username, siteId } = useParams({ from: '/u/$username/sites/$siteId' });
  const section = useParams({
    from: '/u/$username/sites/$siteId/$section',
    select: (p) => p.section,
    shouldThrow: false,
  });
  const activeTab = (section ?? 'overview') as SitePageTab;

  const { refreshSites } = useSites();
  const { username: loggedInUsername } = useConnection();
  const { showToast } = useToast();
  const isPublicView = !!username && username !== loggedInUsername;

  const data = useSiteData(siteId, username, isPublicView);
  const { setStatsRange, setUptimeRange } = data;
  const actions = useSiteActions({
    site: data.site,
    username,
    loadSite: data.loadSite,
    loadVersions: data.loadVersions,
  });

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

  const subdomainBase = data.site?.subdomainBase || hostWithPort;
  const siteUrl = data.site?.subdomain
    ? `${protocol}//${data.site.subdomain}.${subdomainBase}`
    : `${protocol}//${data.site?.siteId}.${subdomainBase}`;

  const totalHits = data.stats.reduce((a, b) => a + b.count, 0);
  const uptimePct = calcUptimePct(data.uptimeData);

  const requestVersionActivate = (index: number) => {
    const v = data.versions.find((vv) => vv.index === index);
    actions.setVersionModal({
      type: 'activate',
      timestamp: index,
      label: v ? new Date(v.createdAt).toLocaleString() : `#${index}`,
    });
  };

  const requestVersionDelete = (index: number) => {
    const v = data.versions.find((vv) => vv.index === index);
    actions.setVersionModal({
      type: 'delete',
      timestamp: index,
      label: v ? new Date(v.createdAt).toLocaleString() : `#${index}`,
    });
  };

  const onUploaded = async () => {
    await data.loadSite();
    await data.loadVersions();
    await refreshSites();
  };

  return {
    site: data.site,
    siteLoading: data.siteLoading,
    notFound: data.notFound,
    activeTab,
    isPublicView,
    username,
    siteId,
    siteUrl,
    host,
    totalHits,
    uptimePct,
    now,
    globalRange,
    setGlobalRange,
    actionLoading: actions.actionLoading,
    confirmAction: actions.confirmAction,
    setConfirmAction: actions.setConfirmAction,
    handleConfirm: actions.handleConfirm,
    stats: data.stats,
    statsLoading: data.statsLoading,
    visitors: data.visitors,
    loadStats: data.loadStats,
    uptimeData: data.uptimeData,
    uptimeAllData: data.uptimeAllData,
    uptimeLoading: data.uptimeLoading,
    loadUptime: data.loadUptime,
    versions: data.versions,
    versionsLoading: data.versionsLoading,
    currentVersion: data.currentVersion,
    activating: actions.activating,
    deletingVersion: actions.deletingVersion,
    requestVersionActivate,
    requestVersionDelete,
    downloadVersion: actions.downloadVersion,
    onUploaded,
    onToast: showToast,
    versionModal: actions.versionModal,
    setVersionModal: actions.setVersionModal,
    handleActivate: actions.handleActivate,
    handleDeleteVersion: actions.handleDeleteVersion,
  };
}
