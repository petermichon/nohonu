import { describe, it, expect } from 'vitest';
import { formatUserAgent } from './userAgent.ts';

const MAC_CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const LINUX_FIREFOX_UA = 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';

describe('formatUserAgent', () => {
  it('returns "Unknown browser" for undefined', () => {
    expect(formatUserAgent(undefined)).toBe('Unknown browser');
  });

  it('returns "Unknown browser" for empty string', () => {
    expect(formatUserAgent('')).toBe('Unknown browser');
  });

  it('returns "Unknown browser" for garbage input', () => {
    expect(formatUserAgent('not a user agent')).toBe('Unknown browser');
  });

  it('formats Chrome on macOS with OS', () => {
    expect(formatUserAgent(MAC_CHROME_UA)).toBe('Chrome on macOS');
  });

  it('formats Firefox on Linux with OS', () => {
    expect(formatUserAgent(LINUX_FIREFOX_UA)).toBe('Firefox on Linux');
  });
});
