import type { SiteData } from '../../shared/paths.ts';

export const DEFAULT_DATA: SiteData = {
  siteId: '',
  nextIndex: 1,
  currentIndex: null,
  enabled: true,
  repoHistory: [],
  versions: {},
  extracted: false,
  lastDeployedAt: undefined,
  starCount: 0,
  starredBy: [],
};
