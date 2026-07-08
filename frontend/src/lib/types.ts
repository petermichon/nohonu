export const SLOT_MS = 60 * 1000;

export interface Site {
  siteId: string;
  domain: string;
  displayName?: string;
  enabled: boolean;
  hits: number;
  uptime: number | null;
  account?: string;
  customDomains?: { domain: string; verified: boolean }[];
  subdomain?: string;
  subdomainBase?: string;
  coverImage?: string;
}

export type VersionSource = { type: 'upload' } | { type: 'github'; repo: string; branch: string };

export interface Version {
  index: number;
  size: number;
  source?: VersionSource;
  createdAt: number;
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

export type TimeRange = 1 | 30 | 60 | 1440;
export type UptimeRange = 1 | 30 | 60 | 1440;
