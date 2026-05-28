import { SITES_DIR, getSiteDataPath, SiteData, RepoEntry } from '../shared/paths.ts';

export const VALID_ACCENT = /^#[0-9a-fA-F]{6}$/;

const DEFAULT_DATA: SiteData = {
  nextIndex: 1,
  currentIndex: null,
  enabled: true,
  repoHistory: [],
  versions: {},
};

export async function loadSiteData(domain: string): Promise<SiteData> {
  try {
    const content = await Deno.readTextFile(getSiteDataPath(domain));
    return { ...DEFAULT_DATA, ...JSON.parse(content) } as SiteData;
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export async function saveSiteData(domain: string, data: SiteData): Promise<void> {
  await Deno.mkdir(SITES_DIR, { recursive: true });
  await Deno.writeTextFile(getSiteDataPath(domain), JSON.stringify(data, null, 2));
}

export async function addRepoToHistory(domain: string, repo: string, branch: string): Promise<void> {
  const data = await loadSiteData(domain);
  const filtered = data.repoHistory.filter((h: RepoEntry) => {
    return !(h.repo === repo && h.branch === branch);
  });
  filtered.unshift({ repo, branch, lastUsed: Date.now() });
  data.repoHistory = filtered.slice(0, 10);
  await saveSiteData(domain, data);
}
