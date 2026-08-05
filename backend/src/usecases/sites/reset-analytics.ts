import { hits, uptime, visitors } from '../../memory.ts';


export function resetAnalytics(): void {
  hits.clear();
  visitors.clear();
  uptime.clear();
}
