import { recordHit } from '../../core/analytics/record-hit.ts';


export function recordPageHit(domain: string, ip: string): void {
  recordHit(domain, ip);
}
