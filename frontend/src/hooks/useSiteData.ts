import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from '../hooks/api/useApiFetch.ts';
import { usePollData } from '../hooks/usePollData.ts';
import { SLOT_MS } from '../lib/types.ts';
import { getGroupMinutes, getSlotsForRange } from '../lib/utils.ts';
import type { Site, Version, Slot, TimeRange } from '../lib/types.ts';

export interface SiteDataReturn {
  site: Site | null;
  siteLoading: boolean;
  notFound: boolean;
  stats: Slot[];
  statsLoading: boolean;
  statsRange: TimeRange;
  setStatsRange: (r: TimeRange) => void;
  versions: Version[];
  versionsLoading: boolean;
  currentVersion: number | null;
  loadSite: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadVersions: () => Promise<void>;
}

export function useSiteData(siteId: string, username?: string, isPublic?: boolean): SiteDataReturn {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();
  const [statsRange, setStatsRange] = useState<TimeRange>(60);
  const statsMountedRef = useRef(false);

  // Site query
  const siteQuery = useQuery({
    queryKey: ['site', siteId, isPublic],
    queryFn: async () => {
      const url = `/users/${username}/sites/${siteId}`;
      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Site not found');
      const data = await res.json();
      return data as Site;
    },
    retry: false,
    enabled: !isPublic || !!username,
  });

  // Stats query
  const statsQuery = useQuery({
    queryKey: ['site-stats', siteId, statsRange],
    queryFn: async () => {
      const slotsToFetch = getSlotsForRange(statsRange);
      const group = getGroupMinutes();
      const res = await apiFetch(`/users/${username}/sites/${siteId}/stats?slots=${slotsToFetch}&group=${group}`);
      const data = await res.json();
      return (data.stats as Slot[]) ?? [];
    },
    retry: false,
  });

  // Versions query
  const versionsQuery = useQuery({
    queryKey: ['site-versions', siteId],
    queryFn: async () => {
      const res = await apiFetch(`/users/${username}/sites/${siteId}/versions`);
      const data = await res.json();
      return {
        versions: (data.versions as Version[]) ?? [],
        current: data.current as number | null,
      };
    },
    retry: false,
  });

  const loadSite = useCallback(async () => {
    await siteQuery.refetch();
  }, [siteQuery]);

  const loadStats = useCallback(async () => {
    await statsQuery.refetch();
  }, [statsQuery]);

  const loadVersions = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['site-versions', siteId] });
  }, [queryClient, siteId]);

  // Reload stats immediately when range selector changes (not on initial mount — usePollData handles that)
  useEffect(() => {
    if (!statsMountedRef.current) {
      statsMountedRef.current = true;
      return;
    }
    loadStats();
  }, [loadStats, statsRange]);

  // Poll stats every minute
  usePollData(
    () => {
      loadStats();
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
    versions: versionsQuery.data?.versions ?? [],
    versionsLoading: versionsQuery.isLoading,
    currentVersion: versionsQuery.data?.current ?? null,
    loadSite,
    loadStats,
    loadVersions,
  };
}