import { SLOT_MS } from './types';

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
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

export function getAccentStyle(accent: string | null | undefined, enabled: boolean): { bg: string; color: string } | null {
  if (!enabled || !accent) return null;
  return { bg: `${accent}22`, color: accent };
}

export function getNextMinuteMs(): number {
  return SLOT_MS - (Date.now() % SLOT_MS);
}
