import { hits, uptime, visitors } from './analytics-state.ts';

export function resetAnalytics(): void {
  hits.clear();
  visitors.clear();
  uptime.clear();
}
