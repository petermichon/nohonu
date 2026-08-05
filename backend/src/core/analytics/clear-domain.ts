import { hits, uptime, visitors } from './analytics-state.ts';

export function clearDomain(domain: string): void {
  hits.delete(domain);
  visitors.delete(domain);
  uptime.delete(domain);
}
