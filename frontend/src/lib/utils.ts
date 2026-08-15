import { SLOT_MS } from './types.ts';

const BAR_COUNT = 60; // Fixed number of bars to show

export function getGroupMinutes(): number {
  // No backend grouping - return raw slots
  return 1;
}

export function getSlotsForRange(range: number): number {
  // range = minutes per bar, so total slots = barCount × range
  return BAR_COUNT * range;
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Updated now';
  if (minutes < 60) return `Updated ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `Updated ${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `Updated ${days} day${days > 1 ? 's' : ''} ago`;
  return `Updated ${new Date(timestamp).toLocaleDateString()}`;
}

export function formatHits(hits: number): string {
  if (hits >= 1_000_000) return `${(hits / 1_000_000).toFixed(1)}M`;
  if (hits >= 1000) return `${(hits / 1000).toFixed(1)}k`;
  return hits.toLocaleString();
}

export function calcUptimePct(uptimeData: { up: boolean | null }[]): number | null {
  const checked = uptimeData.filter((s) => s.up !== null);
  if (checked.length === 0) return null;
  return Math.round((checked.filter((s) => s.up).length / checked.length) * 100);
}

export function getAccentStyle(
  accent: string | null | undefined,
  enabled: boolean
): { bg: string; color: string } | null {
  if (!enabled || !accent) return null;
  return { bg: `${accent}22`, color: accent }; // 22 = ~13% alpha in hex
}

export function getNextMinuteMs(): number {
  return SLOT_MS - (Date.now() % SLOT_MS);
}

export function shouldReloadOnCorruption(error?: Error): boolean {
  return Boolean(error?.message?.includes('React') || error?.message?.includes('hook'));
}

export function parseApiBase(apiBase: string): { host: string; hostWithPort: string; protocol: string } {
  let host = '';
  let hostWithPort = '';
  let protocol = 'http:';
  try {
    ({ host, protocol } = new URL(apiBase));
    hostWithPort = host;
    // Strip port from host for subdomain URLs
    host = host.split(':')[0];
  } catch {
    /* invalid URL */
  }
  return { host, hostWithPort, protocol };
}

export function tabClass(active: boolean): string {
  return `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded-full ${
    active
      ? 'text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800'
      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
  }`;
}

export function siteUrl(
  site: { enabled: boolean; siteId: string; subdomain?: string; subdomainBase?: string },
  protocol: string,
  hostWithPort: string
): string {
  if (!site.enabled) return '';
  const subdomainBase = site.subdomainBase || hostWithPort;
  return site.subdomain
    ? `${protocol}//${site.subdomain}.${subdomainBase}`
    : `${protocol}//${site.siteId}.${subdomainBase}`;
}
