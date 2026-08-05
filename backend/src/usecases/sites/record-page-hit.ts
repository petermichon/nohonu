import { recordHit } from '../../memory/record-hit.ts';

export function recordPageHit(domain: string, ip: string): void {
  recordHit(domain, ip);
}
