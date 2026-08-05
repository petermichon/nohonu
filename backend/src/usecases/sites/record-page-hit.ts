import { recordHit } from '../../core/sites/record-hit.ts';

export function recordPageHit(domain: string, ip: string): void {
  recordHit(domain, ip);
}
