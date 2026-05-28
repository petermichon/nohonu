import {
  readSiteMetadata,
  writeSiteMetadata,
  versionPath,
  DEFAULT_DATA,
  versionsDir,
  domainDir,
} from '../../services/sites-folder.ts';
import { error, json, parseJson } from '../../shared/http.ts';
import type { RouteContext } from './sites-types.ts';

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

export async function fetchGithub(req: Request, { domain }: RouteContext): Promise<Response> {
  const body = await parseJson<{ repo?: unknown; branch?: unknown }>(req);
  if (body instanceof Response) {
    return body;
  }

  const repo = body.repo;
  if (!validateRepo(repo)) {
    return error('Invalid repo format. Use owner/repo');
  }

  let ref: string;
  if (typeof body.branch === 'string' && body.branch.length > 0) {
    ref = body.branch;
  } else {
    ref = 'main';
  }
  const githubUrl = `https://github.com/${repo}/archive/refs/heads/${ref}.zip`;

  let zipData: Uint8Array;
  try {
    const response = await fetch(githubUrl, { redirect: 'follow' });
    if (!response.ok) {
      if (response.status === 404) {
        return error('Repository or branch not found', 404);
      }
      return error(`GitHub error: ${response.status}`, 502);
    }
    const buffer = await response.arrayBuffer();
    zipData = new Uint8Array(buffer);
  } catch (err) {
    console.error('GitHub fetch failed:', err);
    return error('Failed to fetch from GitHub', 502);
  }

  try {
    const existingData = await readSiteMetadata(domain);
    const data = existingData ?? { ...DEFAULT_DATA };
    const filtered = data.repoHistory.filter((h) => {
      return !(h.repo === repo && h.branch === ref);
    });
    filtered.unshift({ repo, branch: ref, lastUsed: Date.now() });
    data.repoHistory = filtered.slice(0, 10);
    await writeSiteMetadata(domain, data);
  } catch (err) {
    console.error('GitHub save failed:', err);
    return error('Failed to save version', 500);
  }

  let result: { success: true; domain: string; index: number };
  try {
    const existingData = await readSiteMetadata(domain);
    const data = existingData ?? { ...DEFAULT_DATA };
    const index = data.nextIndex;
    data.nextIndex = index + 1;
    data.versions[String(index)] = { source: { type: 'github', repo, branch: ref }, createdAt: Date.now() };
    if (data.currentIndex === null) {
      data.currentIndex = index;
    }
    await Deno.mkdir(domainDir(domain), { recursive: true });
    await Deno.mkdir(versionsDir(domain), { recursive: true });
    await Deno.writeFile(versionPath(domain, index), zipData);
    // Write metadata after zip file (validation requires file to exist)
    await writeSiteMetadata(domain, data);
    result = { success: true, domain, index };
  } catch (err) {
    console.error('GitHub save failed:', err);
    return error('Failed to save version', 500);
  }
  return json({ ...result, repo, branch: ref });
}
