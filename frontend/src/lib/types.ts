export const SLOT_MS = 60 * 1000;
export const STATS_SLOTS = 60;
export const UPTIME_SLOTS = 1440;

export interface Site {
  domain: string;
  enabled: boolean;
  hits: number;
  uptime: number | null;
  accent?: string;
}

export type VersionSource = { type: 'upload' } | { type: 'github'; repo: string; branch: string };

export interface Version {
  timestamp: number;
  size: number;
  source?: VersionSource;
}

export interface Slot {
  slot: number;
  count: number;
}

export interface Visitor {
  ip: string;
  count: number;
  last: number;
}

export interface UptimeSlot {
  slot: number;
  up: boolean | null;
}

export type TimeRange = 15 | 60;
export type UptimeRange = 60 | 720 | 1440;

export interface RepoEntry {
  repo: string;
  branch: string;
  lastUsed: number;
}
