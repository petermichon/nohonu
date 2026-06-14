import { describe, it, expect, vi, afterEach } from 'vitest';
import { relativeTime, formatHits, calcUptimePct, getAccentStyle, getNextMinuteMs } from './utils.ts';

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

describe('calcUptimePct', () => {
  it('returns null for empty array', () => {
    expect(calcUptimePct([])).toBeNull();
  });

  it('returns null when all slots are null', () => {
    expect(calcUptimePct([{ up: null }, { up: null }])).toBeNull();
  });

  it('returns 100 when all checked slots are up', () => {
    expect(calcUptimePct([{ up: true }, { up: true }, { up: null }])).toBe(100);
  });

  it('returns 0 when all checked slots are down', () => {
    expect(calcUptimePct([{ up: false }, { up: false }])).toBe(0);
  });

  it('rounds 66.67% to 67', () => {
    expect(calcUptimePct([{ up: true }, { up: true }, { up: false }])).toBe(67);
  });

  it('handles single up slot', () => {
    expect(calcUptimePct([{ up: true }])).toBe(100);
  });

  it('handles single down slot', () => {
    expect(calcUptimePct([{ up: false }])).toBe(0);
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
