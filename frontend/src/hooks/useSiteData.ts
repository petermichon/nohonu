import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApi } from '../lib/api.ts';
import { usePollData } from '../lib/usePollData.ts';
import { extractAccentColor } from '../lib/extractColor.ts';
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
  accent: string | null;
  saveAccent: (color: string | null) => void;
  versions: Version[];
  versionsLoading: boolean;
  currentVersion: number | null;
  loadSite: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadUptime: () => Promise<void>;
  loadVersions: () => Promise<void>;
}

export function useSiteData(domain: string): SiteDataReturn {
  const { apiFetch, apiBase } = useApi();
  const [statsRange, setStatsRange] = useState<TimeRange>(60);
  const [uptimeRange, setUptimeRange] = useState<UptimeRange>(60);
  const [accent, setAccent] = useState<string | null>(null);
  const uptimeMountedRef = useRef(false);
  const statsMountedRef = useRef(false);

  // Site query
  const siteQuery = useQuery({
    queryKey: ['site', domain],
    queryFn: async () => {
      const res = await apiFetch(`/sites/${domain}`);
      if (!res.ok) throw new Error('Site not found');
      const data = await res.json();
      return data as Site;
    },
    retry: false,
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
    await versionsQuery.refetch();
  }, [versionsQuery]);

  const loadVisitors = useCallback(async () => {
    await visitorsQuery.refetch();
  }, [visitorsQuery]);

  const loadUptimeAll = useCallback(async () => {
    await uptimeAllQuery.refetch();
  }, [uptimeAllQuery]);

  // Save accent mutation
  const saveAccentMutation = useMutation({
    mutationFn: async (color: string) => {
      await apiFetch(`/sites/${domain}/meta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accent: color }),
      });
    },
  });

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
          saveAccentMutation.mutate(extractedColor);
        }
      }
    } catch {
      // non-critical
    }
  }, [domain, apiBase, apiFetch, saveAccentMutation]);

  const saveAccent = (color: string | null) => {
    setAccent(color);
    if (color) {
      saveAccentMutation.mutate(color);
    }
  };

  // Initial data load
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadMeta();
    }
  }, [loadMeta]);

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
    accent,
    saveAccent,
    versions: versionsQuery.data?.versions ?? [],
    versionsLoading: versionsQuery.isLoading,
    currentVersion: versionsQuery.data?.current ?? null,
    loadSite,
    loadStats,
    loadUptime,
    loadVersions,
  };
}
