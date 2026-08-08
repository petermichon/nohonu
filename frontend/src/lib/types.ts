import type { ComponentType, CSSProperties } from 'react';

export const SLOT_MS = 60 * 1000;

export interface Site {
  siteId: string;
  domain: string;
  displayName?: string;
  enabled: boolean;
  hits: number;
  uptime: number | null;
  account?: string;
  accountProfilePicture?: string;
  customDomains?: { domain: string; verified: boolean }[];
  subdomain?: string;
  subdomainBase?: string;
  coverImage?: string;
  lastDeployedAt?: number;
  starCount?: number;
  isStarred?: boolean;
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

export type UserPageTab = 'overview' | 'sites' | 'domains' | 'settings' | 'stars';
export type SitePageTab = 'overview' | 'analytics' | 'domains' | 'versions' | 'settings';

export interface Star {
  user: string;
  domain: string;
  createdAt: string;
  displayName?: string;
  starCount?: number;
}

export interface Domain {
  customDomain: string;
  siteDomain: string;
  verified: boolean;
}

export interface MenuOption {
  value: string;
  icon: ComponentType<{ className?: string }> | string | null;
  label: string;
  divider?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface Session {
  id: string;
  username: string;
  userAgent?: string;
  createdAt: number;
  lastActive: number;
}

export interface Me {
  username: string;
  displayName: string;
  profilePicture?: string;
}

export interface Connection {
  apiBase: string;
  serverPassword: string;
  sessionId: string;
  username: string;
}

export interface ConnectionContextType extends Connection {
  setServerPassword: (key: string) => void;
  setSessionId: (sessionId: string) => void;
  setUsername: (username: string) => void;
  disconnect: () => void;
}
