import { recordHit } from './record-hit.ts';

export function recordPageHit(domain: string, ip: string): void {
  recordHit(domain, ip);
}
