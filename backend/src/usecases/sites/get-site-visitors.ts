import { visitors } from '../../memory/visitors.ts';
import { siteKey } from '../../shared/site-key.ts';

export function getSiteVisitors(user: string, siteId: string): { ip: string; count: number; last: number }[] {
  const siteVisitors = visitors.get(siteKey(user, siteId));
  if (!siteVisitors) {
    return [];
  }
  const entries = Array.from(siteVisitors.entries());
  const mapped = entries.map(([ip, data]) => {
    return { ip, ...data };
  });
  const sorted = mapped.sort((a, b) => {
    return b.count - a.count;
  });
  return sorted;
}
