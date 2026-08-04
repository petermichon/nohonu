import type { SiteSummary } from './site-summary.ts';

export interface PublicSiteSummary extends SiteSummary {
  user: string;
}
