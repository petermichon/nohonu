import { visitors } from '../../memory.ts';


export function getSiteVisitors(domain: string): { ip: string; count: number; last: number }[] {
  const domainVisitors = visitors.get(domain);
  if (!domainVisitors) {
    return [];
  }
  const entries = Array.from(domainVisitors.entries());
  const mapped = entries.map(([ip, data]) => {
    return { ip, ...data };
  });
  const sorted = mapped.sort((a, b) => {
    return b.count - a.count;
  });
  return sorted;
}
