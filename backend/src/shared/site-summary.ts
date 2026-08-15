export interface SiteSummary {
  siteId: string;
  enabled: boolean;
  hits: number;
  uptime: number | undefined;
  account?: string;
  accountProfilePicture?: string;
  displayName?: string;
  subdomain?: string;
  coverImage?: string;
  lastDeployedAt?: number;
  starCount?: number;
  isStarred?: boolean;
}
