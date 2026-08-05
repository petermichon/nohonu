import { hits } from '../../memory/hits.ts';
import { uptime } from '../../memory/uptime.ts';
import { visitors } from '../../memory/visitors.ts';

export function resetAnalytics(): void {
  hits.clear();
  visitors.clear();
  uptime.clear();
}
