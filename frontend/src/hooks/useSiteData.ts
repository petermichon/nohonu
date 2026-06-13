import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from '../lib/api.ts';
import { usePollData } from '../lib/usePollData.ts';
import { extractAccentColor } from '../lib/extractColor.ts';
import { SLOT_MS } from '../lib/types.ts';
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
  saveAccent: (color: string | null) => Promise<void>;
  versions: Version[];
  versionsLoading: boolean;
  currentVersion: number | null;
  loadSite: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadUptime: (slots: number) => Promise<void>;
  loadVersions: () => Promise<void>;
}

export function useSiteData(domain: string): SiteDataReturn {
  const { apiFetch, apiBase } = useApi();
  const [site, setSite] = useState<Site | null>(null);
  const [siteLoading, setSiteLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stats, setStats] = useState<Slot[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [uptimeLoading, setUptimeLoading] = useState(false);
  const [statsRange, setStatsRange] = useState<TimeRange>(60);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [uptimeData, setUptimeData] = useState<UptimeSlot[]>([]);
  const [uptimeAllData, setUptimeAllData] = useState<UptimeSlot[]>([]);
  const [uptimeRange, setUptimeRange] = useState<UptimeRange>(60);
  const [accent, setAccent] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const uptimeMountedRef = useRef(false);
  const statsMountedRef = useRef(false);

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
  }, [domain, apiFetch]);

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
  }, [domain, statsRange, apiFetch]);

  const loadVisitors = useCallback(async () => {
    try {
      const res = await apiFetch(`/sites/${domain}/visitors`);
      const data = await res.json();
      setVisitors((data.visitors as Visitor[]) ?? []);
    } catch {
      // non-critical
    }
  }, [domain, apiFetch]);

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
  }, [domain, apiFetch]);

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
  }, [domain, apiBase, apiFetch]);

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
      setUptimeLoading(true);
      try {
        const res = await apiFetch(`/sites/${domain}/uptime?slots=${slots}`);
        const data = await res.json();
        setUptimeData((data.uptime as UptimeSlot[]) ?? []);
      } catch {
        // non-critical
      } finally {
        setUptimeLoading(false);
      }
    },
    [domain, apiFetch]
  );

  const loadUptimeAll = useCallback(async () => {
    try {
      const res = await apiFetch(`/sites/${domain}/uptime?slots=1440`);
      const data = await res.json();
      setUptimeAllData((data.uptime as UptimeSlot[]) ?? []);
    } catch {
      // non-critical
    }
  }, [domain, apiFetch]);

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
      loadUptime(uptimeRange);
      loadUptimeAll();
    },
    SLOT_MS,
    true
  );

  return {
    site,
    siteLoading,
    notFound,
    stats,
    statsLoading,
    statsRange,
    setStatsRange,
    visitors,
    uptimeData,
    uptimeLoading,
    uptimeAllData,
    uptimeRange,
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
  };
}
