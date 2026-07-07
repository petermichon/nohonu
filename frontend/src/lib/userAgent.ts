import { UAParser } from 'ua-parser-js';

export function formatUserAgent(userAgent: string | undefined): string {
  if (!userAgent) {
    return 'Unknown browser';
  }

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();

  const browserName = browser.name || 'Unknown browser';
  const osName = os.name ? ` on ${os.name}` : '';

  return `${browserName}${osName}`;
}
