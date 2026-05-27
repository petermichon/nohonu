import { getMetaPath, getRepoHistoryPath, SiteMeta } from '../shared/paths.ts';

export const VALID_ACCENT = /^#[0-9a-fA-F]{6}$/;

export type RepoEntry = { repo: string; branch: string; lastUsed: number };

export async function loadMeta(domain: string): Promise<SiteMeta> {
  try {
    const content = await Deno.readTextFile(getMetaPath(domain));
    return JSON.parse(content) as SiteMeta;
  } catch {
    return {};
  }
}

export async function saveMeta(domain: string, meta: SiteMeta): Promise<void> {
  const json = JSON.stringify(meta);
  await Deno.writeTextFile(getMetaPath(domain), json);
}

export async function loadRepoHistory(domain: string): Promise<RepoEntry[]> {
  try {
    const content = await Deno.readTextFile(getRepoHistoryPath(domain));
    return JSON.parse(content) as RepoEntry[];
  } catch {
    return [];
  }
}

export async function addRepoToHistory(domain: string, repo: string, branch: string): Promise<void> {
  const history = await loadRepoHistory(domain);
  const filtered = history.filter((h) => {
    return !(h.repo === repo && h.branch === branch);
  });
  filtered.unshift({ repo, branch, lastUsed: Date.now() });
  const data = filtered.slice(0, 10);
  const json = JSON.stringify(data);
  await Deno.writeTextFile(getRepoHistoryPath(domain), json);
}
