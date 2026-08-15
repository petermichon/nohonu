import { recordHit } from '../../core/sites/record-hit.ts';

export function recordPageHit(user: string, siteId: string, ip: string): void {
  recordHit(user, siteId, ip);
}
