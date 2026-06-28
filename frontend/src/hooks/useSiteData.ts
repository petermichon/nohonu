import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/api.ts';
import { usePollData } from '../lib/usePollData.ts';
import { SLOT_MS } from '../lib/types.ts';
import { getGroupMinutes, getSlotsForRange } from '../lib/utils.ts';
import type { Site, Version, Slot, Visitor, UptimeSlot, TimeRange, UptimeRange } from '../lib/types.ts';

export interface SiteDataReturn {
  site: Site | null;
  siteLoading: boolean;
  notFound: boolean;
  stats: Slot[];
  statsLoading: boolean;
  statsRange: TimeRange;
  setStatsRange: (r: TimeRange) => void;
  visitors: Visitor[];
  uptimeData: UptimeSlot[];
  uptimeLoading: boolean;
  uptimeAllData: UptimeSlot[];
  uptimeRange: UptimeRange;
  setUptimeRange: (r: UptimeRange) => void;
  versions: Version[];
  versionsLoading: boolean;
  currentVersion: number | null;
  loadSite: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadUptime: () => Promise<void>;
  loadVersions: () => Promise<void>;
}

export function useSiteData(domain: string, username?: string, isPublic?: boolean): SiteDataReturn {
  const { apiFetch, apiBase } = useApi();
  const queryClient = useQueryClient();
  const [statsRange, setStatsRange] = useState<TimeRange>(60);
  const [uptimeRange, setUptimeRange] = useState<UptimeRange>(60);
  const uptimeMountedRef = useRef(false);
  const statsMountedRef = useRef(false);

  // Site query
  const siteQuery = useQuery({
    queryKey: ['site', domain, isPublic],
    queryFn: async () => {
      const url = isPublic && username ? `${apiBase}/users/${username}/${domain}` : `/sites/${domain}`;
      const res = await (isPublic && username ? fetch(url) : apiFetch(url));
      if (!res.ok) throw new Error('Site not found');
      const data = await res.json();
      return data as Site;
    },
    retry: false,
    enabled: !isPublic || !!username,
  });

  // Stats query
  const statsQuery = useQuery({
    queryKey: ['site-stats', domain, statsRange],
    queryFn: async () => {
      const slotsToFetch = getSlotsForRange(statsRange);
      const group = getGroupMinutes();
      const res = await apiFetch(`/sites/${domain}/stats?slots=${slotsToFetch}&group=${group}`);
      const data = await res.json();
      return (data.stats as Slot[]) ?? [];
    },
    retry: false,
  });

  // Visitors query
  const visitorsQuery = useQuery({
    queryKey: ['site-visitors', domain],
    queryFn: async () => {
      const res = await apiFetch(`/sites/${domain}/visitors`);
      const data = await res.json();
      return (data.visitors as Visitor[]) ?? [];
    },
    retry: false,
  });

  // Versions query
  const versionsQuery = useQuery({
    queryKey: ['site-versions', domain],
    queryFn: async () => {
      const res = await apiFetch(`/sites/${domain}/versions`);
      const data = await res.json();
      return {
        versions: (data.versions as Version[]) ?? [],
        current: data.current as number | null,
      };
    },
    retry: false,
  });

  // Uptime query
  const uptimeQuery = useQuery({
    queryKey: ['site-uptime', domain, uptimeRange],
    queryFn: async () => {
      const slotsToFetch = getSlotsForRange(uptimeRange);
      const group = getGroupMinutes();
      const res = await apiFetch(`/sites/${domain}/uptime?slots=${slotsToFetch}&group=${group}`);
      const data = await res.json();
      return (data.uptime as UptimeSlot[]) ?? [];
    },
    retry: false,
  });

  // Uptime all query
  const uptimeAllQuery = useQuery({
    queryKey: ['site-uptime-all', domain],
    queryFn: async () => {
      const res = await apiFetch(`/sites/${domain}/uptime?slots=1440`);
      const data = await res.json();
      return (data.uptime as UptimeSlot[]) ?? [];
    },
    retry: false,
  });

  const loadSite = useCallback(async () => {
    await siteQuery.refetch();
  }, [siteQuery]);

  const loadStats = useCallback(async () => {
    await statsQuery.refetch();
  }, [statsQuery]);

  const loadUptime = useCallback(async () => {
    await uptimeQuery.refetch();
  }, [uptimeQuery]);

  const loadVersions = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['site-versions', domain] });
  }, [queryClient, domain]);

  const loadVisitors = useCallback(async () => {
    await visitorsQuery.refetch();
  }, [visitorsQuery]);

  const loadUptimeAll = useCallback(async () => {
    await uptimeAllQuery.refetch();
  }, [uptimeAllQuery]);

  // Reload uptime only when range changes (not on initial mount — usePollData handles that)
  useEffect(() => {
    if (!uptimeMountedRef.current) {
      uptimeMountedRef.current = true;
      return;
    }
    loadUptime();
  }, [loadUptime, uptimeRange]);

  // Reload stats immediately when range selector changes (not on initial mount — usePollData handles that)
  useEffect(() => {
    if (!statsMountedRef.current) {
      statsMountedRef.current = true;
      return;
    }
    loadStats();
  }, [loadStats, statsRange]);

  // Poll stats and visitors every minute
  usePollData(
    () => {
      loadStats();
      loadVisitors();
      loadUptime();
      loadUptimeAll();
    },
    SLOT_MS,
    true
  );

  return {
    site: siteQuery.data ?? null,
    siteLoading: siteQuery.isLoading,
    notFound: siteQuery.isError,
    stats: statsQuery.data ?? [],
    statsLoading: statsQuery.isLoading,
    statsRange,
    setStatsRange,
    visitors: visitorsQuery.data ?? [],
    uptimeData: uptimeQuery.data ?? [],
    uptimeLoading: uptimeQuery.isLoading,
    uptimeAllData: uptimeAllQuery.data ?? [],
    uptimeRange,
    setUptimeRange,
    versions: versionsQuery.data?.versions ?? [],
    versionsLoading: versionsQuery.isLoading,
    currentVersion: versionsQuery.data?.current ?? null,
    loadSite,
    loadStats,
    loadUptime,
    loadVersions,
  };
}
