import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  relativeTime,
  formatHits,
  getAccentStyle,
  getNextMinuteMs,
  formatRelativeTime,
  parseApiBase,
  siteUrl,
  shouldReloadOnCorruption,
  getSlotsForRange,
  getGroupMinutes,
  tabClass,
} from './utils.ts';

describe('relativeTime', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "just now" for less than 60 seconds ago', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(relativeTime(1_000_000 - 30_000)).toBe('just now');
  });

  it('returns minutes ago', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(relativeTime(1_000_000 - 120_000)).toBe('2m ago');
  });

  it('returns hours ago', () => {
    vi.spyOn(Date, 'now').mockReturnValue(10_000_000);
    expect(relativeTime(10_000_000 - 7_200_000)).toBe('2h ago');
  });

  it('returns days ago', () => {
    vi.spyOn(Date, 'now').mockReturnValue(200_000_000);
    expect(relativeTime(200_000_000 - 172_800_000)).toBe('2d ago');
  });

  it('returns "just now" at exactly 0ms diff', () => {
    vi.spyOn(Date, 'now').mockReturnValue(500_000);
    expect(relativeTime(500_000)).toBe('just now');
  });

  it('boundary: exactly 60s returns "1m ago"', () => {
    vi.spyOn(Date, 'now').mockReturnValue(120_000);
    expect(relativeTime(120_000 - 60_000)).toBe('1m ago');
  });
});

describe('formatHits', () => {
  it('formats millions', () => {
    expect(formatHits(2_500_000)).toBe('2.5M');
  });

  it('formats thousands', () => {
    expect(formatHits(1_500)).toBe('1.5k');
  });

  it('formats small numbers', () => {
    expect(formatHits(42)).toBe('42');
  });

  it('formats exactly 1000 as k', () => {
    expect(formatHits(1000)).toBe('1.0k');
  });

  it('formats exactly 1_000_000 as M', () => {
    expect(formatHits(1_000_000)).toBe('1.0M');
  });

  it('formats zero', () => {
    expect(formatHits(0)).toBe('0');
  });
});
describe('getAccentStyle', () => {
  it('returns null when not enabled', () => {
    expect(getAccentStyle('#ff0000', false)).toBeNull();
  });

  it('returns null when accent is null', () => {
    expect(getAccentStyle(null, true)).toBeNull();
  });

  it('returns null when accent is undefined', () => {
    expect(getAccentStyle(undefined, true)).toBeNull();
  });

  it('returns null when both disabled and no accent', () => {
    expect(getAccentStyle(null, false)).toBeNull();
  });

  it('returns style object with hex + alpha suffix', () => {
    expect(getAccentStyle('#ff0000', true)).toEqual({
      bg: '#ff000022',
      color: '#ff0000',
    });
  });

  it('works with any color string', () => {
    expect(getAccentStyle('#abcdef', true)).toEqual({
      bg: '#abcdef22',
      color: '#abcdef',
    });
  });
});

describe('getNextMinuteMs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns remaining ms until next minute boundary', () => {
    // 30.5 seconds into a minute → 29500ms remaining
    vi.spyOn(Date, 'now').mockReturnValue(60_000 + 30_500);
    expect(getNextMinuteMs()).toBe(29_500);
  });

  it('returns full SLOT_MS when exactly on boundary', () => {
    vi.spyOn(Date, 'now').mockReturnValue(60_000);
    expect(getNextMinuteMs()).toBe(60_000);
  });

  it('returns 1 when 1ms before boundary', () => {
    vi.spyOn(Date, 'now').mockReturnValue(119_999);
    expect(getNextMinuteMs()).toBe(1);
  });
});

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "Updated now" for less than 60 seconds', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(formatRelativeTime(1_000_000 - 5_000)).toBe('Updated now');
  });

  it('returns singular minute', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(formatRelativeTime(1_000_000 - 60_000)).toBe('Updated 1 minute ago');
  });

  it('returns plural minutes', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(formatRelativeTime(1_000_000 - 2 * 60_000)).toBe('Updated 2 minutes ago');
  });

  it('returns singular hour', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(formatRelativeTime(1_000_000 - 3_600_000)).toBe('Updated 1 hour ago');
  });

  it('returns plural hours', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(formatRelativeTime(1_000_000 - 2 * 3_600_000)).toBe('Updated 2 hours ago');
  });

  it('returns singular day', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(formatRelativeTime(1_000_000 - 86_400_000)).toBe('Updated 1 day ago');
  });

  it('returns plural days', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(formatRelativeTime(1_000_000 - 5 * 86_400_000)).toBe('Updated 5 days ago');
  });

  it('falls back to a date for 7+ days', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    expect(formatRelativeTime(1_000_000 - 8 * 86_400_000)).toMatch(/^Updated /);
  });
});

describe('getSlotsForRange', () => {
  it('returns 60 slots for 1-minute range', () => {
    expect(getSlotsForRange(1)).toBe(60);
  });

  it('returns 1800 slots for 30-minute range', () => {
    expect(getSlotsForRange(30)).toBe(1800);
  });

  it('returns 86400 slots for daily range', () => {
    expect(getSlotsForRange(1440)).toBe(86400);
  });
});

describe('getGroupMinutes', () => {
  it('returns 1 (no backend grouping)', () => {
    expect(getGroupMinutes()).toBe(1);
  });
});

describe('parseApiBase', () => {
  it('parses localhost with port', () => {
    expect(parseApiBase('http://localhost:8080')).toEqual({
      host: 'localhost',
      hostWithPort: 'localhost:8080',
      protocol: 'http:',
    });
  });

  it('parses https host with port and strips port from host', () => {
    expect(parseApiBase('https://api.example.com:8443')).toEqual({
      host: 'api.example.com',
      hostWithPort: 'api.example.com:8443',
      protocol: 'https:',
    });
  });

  it('parses a base URL without port', () => {
    expect(parseApiBase('https://nohonu.com/api')).toEqual({
      host: 'nohonu.com',
      hostWithPort: 'nohonu.com',
      protocol: 'https:',
    });
  });

  it('falls back to empty host for invalid URL', () => {
    expect(parseApiBase('not-a-url')).toEqual({
      host: '',
      hostWithPort: '',
      protocol: 'http:',
    });
  });
});

describe('siteUrl', () => {
  it('returns empty string when site is disabled', () => {
    expect(siteUrl({ enabled: false, siteId: 'example.com' }, 'https:', 'localhost:8080')).toBe('');
  });

  it('builds a subdomain URL using hostWithPort', () => {
    expect(siteUrl({ enabled: true, siteId: 'example.com', subdomain: 'foo' }, 'https:', 'localhost:8080')).toBe(
      'https://foo.localhost:8080'
    );
  });

  it('builds a domain URL using hostWithPort', () => {
    expect(siteUrl({ enabled: true, siteId: 'example.com' }, 'https:', 'localhost:8080')).toBe(
      'https://example.com.localhost:8080'
    );
  });

  it('prefers subdomainBase over hostWithPort', () => {
    expect(
      siteUrl({ enabled: true, siteId: 'example.com', subdomain: 'foo', subdomainBase: 'nohonu.com' }, 'https:', 'x')
    ).toBe('https://foo.nohonu.com');
  });

  it('uses protocol as-is', () => {
    expect(siteUrl({ enabled: true, siteId: 'example.com', subdomain: 'foo' }, 'http:', 'localhost:8080')).toBe(
      'http://foo.localhost:8080'
    );
  });
});

describe('shouldReloadOnCorruption', () => {
  it('returns true when message mentions React', () => {
    expect(shouldReloadOnCorruption(new Error('Minified React error #130'))).toBe(true);
  });

  it('returns true when message mentions hook', () => {
    expect(shouldReloadOnCorruption(new Error('Invalid hook call'))).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(shouldReloadOnCorruption(new Error('TypeError: x is not a function'))).toBe(false);
  });

  it('returns false for undefined error', () => {
    expect(shouldReloadOnCorruption(undefined)).toBe(false);
  });

  it('returns false for empty message', () => {
    expect(shouldReloadOnCorruption(new Error())).toBe(false);
  });
});

describe('tabClass', () => {
  it('returns active classes when active', () => {
    const classes = tabClass(true);
    expect(classes).toContain('text-zinc-950');
    expect(classes).toContain('bg-zinc-100');
  });

  it('returns inactive classes when not active', () => {
    const classes = tabClass(false);
    expect(classes).toContain('text-zinc-500');
    expect(classes).toContain('hover:text-zinc-700');
  });

  it('includes shared base classes in both states', () => {
    expect(tabClass(true)).toContain('rounded-full');
    expect(tabClass(false)).toContain('rounded-full');
    expect(tabClass(true)).toContain('flex');
    expect(tabClass(false)).toContain('flex');
  });
});
