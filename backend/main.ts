async function readZip(data: Uint8Array): Promise<Record<string, Uint8Array>> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const files: Record<string, Uint8Array> = {};

  // Find End of Central Directory record (search from end)
  let eocdOffset = -1;
  for (let i = data.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocdOffset = i; break; }
  }
  if (eocdOffset === -1) throw new Error('Not a valid zip file');

  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const cdSize = view.getUint32(eocdOffset + 12, true);

  // Walk Central Directory
  let cdPos = cdOffset;
  while (cdPos < cdOffset + cdSize) {
    if (view.getUint32(cdPos, true) !== 0x02014b50) break;
    const method = view.getUint16(cdPos + 10, true);
    const compSize = view.getUint32(cdPos + 20, true);
    const nameLen = view.getUint16(cdPos + 28, true);
    const extraLen = view.getUint16(cdPos + 30, true);
    const commentLen = view.getUint16(cdPos + 32, true);
    const localOffset = view.getUint32(cdPos + 42, true);
    const name = new TextDecoder().decode(data.slice(cdPos + 46, cdPos + 46 + nameLen));
    cdPos += 46 + nameLen + extraLen + commentLen;

    if (name.endsWith('/')) continue;

    // Read local file header to get actual data start
    const localExtraLen = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + nameLen + localExtraLen;
    const compressed = data.slice(dataStart, dataStart + compSize);

    if (method === 0) {
      files[name] = compressed;
    } else if (method === 8) {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      writer.write(compressed);
      writer.close();
      const chunks: Uint8Array[] = [];
      let len = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); len += value.length;
      }
      const out = new Uint8Array(len);
      let pos = 0;
      for (const c of chunks) { out.set(c, pos); pos += c.length; }
      files[name] = out;
    }
  }
  return files;
}

const SITES_DIR = Deno.env.get('SITES_DIR') || './sites';
const VALID_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

type VersionSource = { type: 'upload' } | { type: 'github'; repo: string; branch: string };
// Version format: domain@timestamp.zip
type Version = { timestamp: number; size: number; source?: VersionSource };

function getVersionPath(domain: string, timestamp: number): string {
  return `${SITES_DIR}/${domain}@${timestamp}.zip`;
}

function getVersionMetaPath(domain: string, timestamp: number): string {
  return `${SITES_DIR}/${domain}@${timestamp}.json`;
}

function getRepoHistoryPath(domain: string): string {
  return `${SITES_DIR}/${domain}.repos.json`;
}

function getMetaPath(domain: string): string {
  return `${SITES_DIR}/${domain}.meta.json`;
}

type SiteMeta = { accent?: string };

const VALID_ACCENT = /^#[0-9a-fA-F]{6}$/;

async function loadMeta(domain: string): Promise<SiteMeta> {
  try {
    const content = await Deno.readTextFile(getMetaPath(domain));
    return JSON.parse(content) as SiteMeta;
  } catch {
    return {};
  }
}

async function saveMeta(domain: string, meta: SiteMeta): Promise<void> {
  await Deno.writeTextFile(getMetaPath(domain), JSON.stringify(meta));
}

type RepoEntry = { repo: string; branch: string; lastUsed: number };

async function loadRepoHistory(domain: string): Promise<RepoEntry[]> {
  try {
    const content = await Deno.readTextFile(getRepoHistoryPath(domain));
    return JSON.parse(content) as RepoEntry[];
  } catch {
    return [];
  }
}

async function addRepoToHistory(domain: string, repo: string, branch: string) {
  const history = await loadRepoHistory(domain);
  const filtered = history.filter((h) => !(h.repo === repo && h.branch === branch));
  filtered.unshift({ repo, branch, lastUsed: Date.now() });
  await Deno.writeTextFile(getRepoHistoryPath(domain), JSON.stringify(filtered.slice(0, 10)));
}

function getCurrentVersionPath(domain: string, enabled = true): string {
  return `${SITES_DIR}/${domain}.zip${enabled ? '' : '.disabled'}`;
}

async function loadVersionSource(domain: string, timestamp: number): Promise<VersionSource | undefined> {
  try {
    const content = await Deno.readTextFile(getVersionMetaPath(domain, timestamp));
    return JSON.parse(content) as VersionSource;
  } catch {
    return undefined;
  }
}

async function listVersions(domain: string): Promise<Version[]> {
  const versions: Version[] = [];
  const prefix = `${domain}@`;

  for (const enabled of [true, false]) {
    const path = getCurrentVersionPath(domain, enabled);
    const stat = await Deno.stat(path).catch(() => null);
    if (stat) {
      const timestamp = stat.mtime?.getTime() ?? Date.now();
      versions.push({ timestamp, size: stat.size, source: await loadVersionSource(domain, 0) });
    }
  }

  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.name.startsWith(prefix) && entry.name.endsWith('.zip') && !entry.name.includes('.disabled')) {
        const timestamp = parseInt(entry.name.slice(prefix.length, -4), 10);
        if (!isNaN(timestamp)) {
          const stat = await Deno.stat(`${SITES_DIR}/${entry.name}`).catch(() => null);
          if (stat) {
            versions.push({ timestamp, size: stat.size, source: await loadVersionSource(domain, timestamp) });
          }
        }
      }
    }
  } catch { /* no dir */ }

  return versions.sort((a, b) => b.timestamp - a.timestamp);
}

async function getCurrentVersionTimestamp(domain: string): Promise<number | null> {
  for (const enabled of [true, false]) {
    const stat = await Deno.stat(getCurrentVersionPath(domain, enabled)).catch(() => null);
    if (stat) return stat.mtime?.getTime() ?? null;
  }
  return null;
}

const SLOT_MS = 60 * 1000;
const STATS_SLOTS = 60;
const hits = new Map<string, Map<number, number>>();
const visitors = new Map<string, Map<string, { count: number; last: number }>>();

function recordHit(domain: string, ip: string) {
  const slot = Math.floor(Date.now() / SLOT_MS);
  const domainHits = hits.get(domain) ?? new Map();
  hits.set(domain, domainHits);
  domainHits.set(slot, (domainHits.get(slot) ?? 0) + 1);
  const cutoff = slot - STATS_SLOTS;
  for (const k of domainHits.keys()) if (k < cutoff) domainHits.delete(k);

  const domainVisitors = visitors.get(domain) ?? new Map();
  visitors.set(domain, domainVisitors);
  const existing = domainVisitors.get(ip);
  domainVisitors.set(ip, { count: (existing?.count ?? 0) + 1, last: Date.now() });
}

function getVisitors(domain: string): { ip: string; count: number; last: number }[] {
  const domainVisitors = visitors.get(domain);
  if (!domainVisitors) return [];
  return Array.from(domainVisitors.entries())
    .map(([ip, data]) => ({ ip, ...data }))
    .sort((a, b) => b.count - a.count);
}

function getStats(domain: string, slots = STATS_SLOTS): { slot: number; count: number }[] {
  const now = Math.floor(Date.now() / SLOT_MS);
  const d = hits.get(domain) ?? new Map<number, number>();
  const count = Math.min(slots, STATS_SLOTS);
  return Array.from({ length: count }, (_, i) => {
    const slot = now - (count - 1 - i);
    return { slot, count: d.get(slot) ?? 0 };
  });
}

const UPTIME_SLOTS = 1440;
const uptime = new Map<string, Map<number, boolean>>();

function recordUptime(domain: string, up: boolean) {
  const slot = Math.floor(Date.now() / SLOT_MS);
  const d = uptime.get(domain) ?? new Map();
  uptime.set(domain, d);
  d.set(slot, up);
  const cutoff = slot - UPTIME_SLOTS;
  for (const k of d.keys()) if (k < cutoff) d.delete(k);
}

function getUptime(domain: string, slots = 60): { slot: number; up: boolean | null }[] {
  const now = Math.floor(Date.now() / SLOT_MS);
  const d = uptime.get(domain);
  const count = Math.min(slots, UPTIME_SLOTS);
  return Array.from({ length: count }, (_, i) => {
    const slot = now - (count - 1 - i);
    return { slot, up: d?.has(slot) ? (d.get(slot) ?? false) : null };
  });
}

async function checkSiteUptime(domain: string): Promise<boolean> {
  const zipPath = await resolveZipPath(domain);
  if (!zipPath) return false;
  return zipPath === getCurrentVersionPath(domain, true);
}

async function runUptimeChecks() {
  const sites = await listSites();
  await Promise.all(sites.map(async ({ domain }) => {
    const up = await checkSiteUptime(domain);
    recordUptime(domain, up);
  }));
}

function scheduleUptimeChecks() {
  const msToNextMinute = SLOT_MS - (Date.now() % SLOT_MS);
  setTimeout(() => {
    runUptimeChecks();
    setInterval(runUptimeChecks, SLOT_MS);
  }, msToNextMinute);
}

scheduleUptimeChecks();

function getTotalHits(domain: string): number {
  const d = hits.get(domain);
  if (!d) return 0;
  let total = 0;
  for (const count of d.values()) total += count;
  return total;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
};

const API_KEY = Deno.env.get('API_KEY');

function requireAuth(req: Request): Response | null {
  if (!API_KEY) return null;
  if (req.headers.get('X-Api-Key') === API_KEY) return null;
  return error('Unauthorized', 401);
}

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: CORS });

const error = (message: string, status = 400) =>
  json({ error: message }, status);

function validateDomain(domain: unknown): domain is string {
  return typeof domain === 'string' && VALID_DOMAIN.test(domain);
}

function getUptimePct(domain: string): number | null {
  const d = uptime.get(domain);
  if (!d || d.size === 0) return null;
  let up = 0;
  for (const v of d.values()) if (v) up++;
  return Math.round((up / d.size) * 100);
}

async function listSites(): Promise<{ domain: string; enabled: boolean; hits: number; uptime: number | null; accent?: string }[]> {
  const sites: { domain: string; enabled: boolean; hits: number; uptime: number | null; accent?: string }[] = [];
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.name.includes('@')) continue;
      const disabled = entry.name.endsWith('.zip.disabled');
      if (disabled || entry.name.endsWith('.zip')) {
        const domain = entry.name.slice(0, disabled ? -'.zip.disabled'.length : -'.zip'.length);
        const meta = await loadMeta(domain);
        sites.push({ domain, enabled: !disabled, hits: getTotalHits(domain), uptime: getUptimePct(domain), accent: meta.accent });
      }
    }
  } catch { /* no dir */ }
  return sites;
}

async function handleGetMeta(domain: string) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const meta = await loadMeta(domain);
  return json({ domain, ...meta });
}

async function handlePatchMeta(domain: string, req: Request) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const body = await req.json().catch(() => null);
  if (!body) return error('Invalid JSON');
  const current = await loadMeta(domain);
  if ('accent' in body) {
    if (body.accent !== null && !VALID_ACCENT.test(body.accent)) return error('Invalid accent color');
    current.accent = body.accent ?? undefined;
  }
  await saveMeta(domain, current);
  return json({ success: true, domain, ...current });
}


async function extractSite(domain: string): Promise<boolean> {
  const siteDir = `${SITES_DIR}/${domain}`;
  const zipPath = getCurrentVersionPath(domain, true);

  if (await Deno.stat(siteDir).then(() => true).catch(() => false)) return true;
  if (!await Deno.stat(zipPath).then(() => true).catch(() => false)) return false;

  try {
    await Deno.mkdir(siteDir, { recursive: true });
    const zipData = await Deno.readFile(zipPath);
    const files = await readZip(zipData);
    for (const [relativePath, data] of Object.entries(files)) {
      const outPath = `${siteDir}/${relativePath}`;
      const dir = outPath.substring(0, outPath.lastIndexOf('/'));
      await Deno.mkdir(dir, { recursive: true });
      await Deno.writeFile(outPath, data);
    }
    return true;
  } catch (err) {
    console.error('Extraction error:', err);
    await Deno.remove(siteDir, { recursive: true }).catch(() => {});
    return false;
  }
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
  };
  return types[ext] || 'application/octet-stream';
}

function handleGetStats(domain: string, slots: number) {
  if (!validateDomain(domain)) return error('Invalid domain');
  return json({ domain, stats: getStats(domain, slots) });
}

function handleGetVisitors(domain: string) {
  if (!validateDomain(domain)) return error('Invalid domain');
  return json({ domain, visitors: getVisitors(domain) });
}

function handleGetUptime(domain: string, slots: number) {
  if (!validateDomain(domain)) return error('Invalid domain');
  return json({ domain, uptime: getUptime(domain, slots) });
}

const FAVICON_CANDIDATES: { name: string; type: string }[] = [
  { name: 'favicon.ico', type: 'image/x-icon' },
  { name: 'favicon.png', type: 'image/png' },
  { name: 'favicon.svg', type: 'image/svg+xml' },
];

async function handleGetIcon(domain: string) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const zipPath = await resolveZipPath(domain);
  if (!zipPath) return error('Site not found', 404);

  try {
    const zipData = await Deno.readFile(zipPath);
    const files = await readZip(zipData);
    for (const { name, type } of FAVICON_CANDIDATES) {
      const data = files[name];
      if (data && data.length > 0) {
        return new Response(data.buffer as ArrayBuffer, {
          headers: { ...CORS, 'Content-Type': type, 'Cache-Control': 'public, max-age=300' },
        });
      }
    }
  } catch (err) {
    console.error('Icon extraction error:', err);
  }
  return new Response(null, { status: 404, headers: CORS });
}

async function handleListSites() {
  return json({ sites: await listSites() });
}

async function resolveZipPath(domain: string): Promise<string | null> {
  const enabled = getCurrentVersionPath(domain, true);
  if (await Deno.stat(enabled).then(() => true).catch(() => false)) return enabled;
  const disabled = getCurrentVersionPath(domain, false);
  if (await Deno.stat(disabled).then(() => true).catch(() => false)) return disabled;
  return null;
}

async function handleDownloadSite(domain: string) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const zipPath = await resolveZipPath(domain);
  if (!zipPath) return error('Site not found', 404);
  const file = await Deno.open(zipPath);
  return new Response(file.readable, {
    headers: {
      ...CORS,
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${domain}.zip"`,
    },
  });
}

async function handleDeleteSite(domain: string) {
  if (!validateDomain(domain)) return error('Invalid domain');

  const siteDir = `${SITES_DIR}/${domain}`;
  const prefix = `${domain}@`;

  for (const enabled of [true, false]) {
    await Deno.remove(getCurrentVersionPath(domain, enabled)).catch(() => {});
  }
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.name.startsWith(prefix) && entry.name.endsWith('.zip')) {
        await Deno.remove(`${SITES_DIR}/${entry.name}`).catch(() => {});
      }
    }
  } catch { /* no dir */ }
  await Deno.remove(siteDir, { recursive: true }).catch(() => {});

  return json({ success: true, domain });
}

async function handleGetSite(domain: string) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const zipPath = await resolveZipPath(domain);
  if (!zipPath) return error('Site not found', 404);
  const enabled = zipPath === getCurrentVersionPath(domain, true);
  return json({ domain, enabled });
}

async function saveZipAsVersion(domain: string, zipData: Uint8Array, source?: VersionSource) {
  await Deno.mkdir(SITES_DIR, { recursive: true });
  const timestamp = Date.now();
  await Deno.writeFile(getVersionPath(domain, timestamp), zipData);
  if (source) {
    await Deno.writeTextFile(getVersionMetaPath(domain, timestamp), JSON.stringify(source));
  }
  const hasLive = await resolveZipPath(domain);
  if (!hasLive) {
    await Deno.rename(getVersionPath(domain, timestamp), getCurrentVersionPath(domain, true));
    if (source) {
      await Deno.rename(getVersionMetaPath(domain, timestamp), getVersionMetaPath(domain, 0));
    }
    await Deno.remove(`${SITES_DIR}/${domain}`, { recursive: true }).catch(() => {});
  }
  return { success: true, domain, timestamp };
}

async function handleUpload(req: Request) {
  const formData = await req.formData();
  let domain = formData.get('domain');
  const zipFile = formData.get('zip');

  if (!(zipFile instanceof File)) {
    return error('Missing zip file');
  }

  if (!domain || domain === '') {
    domain = zipFile.name.replace(/\.zip$/i, '');
  }

  if (!validateDomain(domain)) {
    return error('Invalid domain. Use lowercase letters, numbers, and hyphens only.');
  }

  const result = await saveZipAsVersion(domain, new Uint8Array(await zipFile.arrayBuffer()), { type: 'upload' });
  return json(result);
}

const GITHUB_REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}

async function handleFetchGitHub(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return error('Invalid JSON');

  const { domain, repo, branch } = body;

  if (!validateDomain(domain)) return error('Invalid domain');
  if (!validateRepo(repo)) return error('Invalid repo format. Use owner/repo');

  const ref = typeof branch === 'string' && branch.length > 0 ? branch : 'main';
  const githubUrl = `https://github.com/${repo}/archive/refs/heads/${ref}.zip`;

  try {
    const response = await fetch(githubUrl, { redirect: 'follow' });
    if (!response.ok) {
      if (response.status === 404) return error('Repository or branch not found', 404);
      return error(`GitHub error: ${response.status}`, 502);
    }
    const zipData = new Uint8Array(await response.arrayBuffer());
    await addRepoToHistory(domain, repo, ref);
    const result = await saveZipAsVersion(domain, zipData, { type: 'github', repo, branch: ref });
    return json({ ...result, repo, branch: ref });
  } catch (err) {
    console.error('GitHub fetch failed:', err);
    return error('Failed to fetch from GitHub', 502);
  }
}

async function handleGetRepoHistory(domain: string) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const history = await loadRepoHistory(domain);
  return json({ domain, history });
}

async function handleListVersions(domain: string) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const versions = await listVersions(domain);
  const current = await getCurrentVersionTimestamp(domain);
  return json({ domain, versions, current });
}

async function archiveCurrentVersions(domain: string) {
  for (const enabled of [true, false]) {
    const path = getCurrentVersionPath(domain, enabled);
    const stat = await Deno.stat(path).catch(() => null);
    if (stat) await Deno.rename(path, getVersionPath(domain, stat.mtime?.getTime() ?? Date.now()));
  }
}

async function handleActivate(domain: string, timestamp: number) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const targetPath = getVersionPath(domain, timestamp);
  try { await Deno.stat(targetPath); } catch { return error('Version not found', 404); }

  await archiveCurrentVersions(domain);
  await Deno.rename(targetPath, getCurrentVersionPath(domain, true));
  await Deno.remove(`${SITES_DIR}/${domain}`, { recursive: true }).catch(() => {});

  return json({ success: true, domain, timestamp });
}

async function handleDownloadVersion(domain: string, timestamp: number) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const path = getVersionPath(domain, timestamp);
  try { await Deno.stat(path); } catch { return error('Version not found', 404); }
  const file = await Deno.open(path);
  return new Response(file.readable, {
    headers: {
      ...CORS,
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${domain}-${timestamp}.zip"`,
    },
  });
}

async function handleDeleteVersion(domain: string, timestamp: number) {
  if (!validateDomain(domain)) return error('Invalid domain');
  const path = getVersionPath(domain, timestamp);
  try { await Deno.stat(path); } catch { return error('Version not found', 404); }
  await Deno.remove(path);
  return json({ success: true, domain, timestamp });
}

async function handleToggleSite(domain: string) {
  if (!validateDomain(domain)) return error('Invalid domain');

  const enabledPath = getCurrentVersionPath(domain, true);
  const disabledPath = getCurrentVersionPath(domain, false);

  if (await Deno.stat(enabledPath).then(() => true).catch(() => false)) {
    await Deno.rename(enabledPath, disabledPath);
    await Deno.remove(`${SITES_DIR}/${domain}`, { recursive: true }).catch(() => {});
    return json({ success: true, domain, enabled: false });
  }

  if (await Deno.stat(disabledPath).then(() => true).catch(() => false)) {
    await Deno.rename(disabledPath, enabledPath);
    return json({ success: true, domain, enabled: true });
  }

  return error('Site not found', 404);
}

async function handleServeStatic(req: Request, path: string, remoteAddr?: Deno.NetAddr): Promise<Response> {
  const host = req.headers.get('Host') || '';
  const subdomainMatch = host.match(/^([^.]+)\./);

  let domain: string | null = null;
  let filePath = path;

  if (subdomainMatch && !['www', 'localhost'].includes(subdomainMatch[1])) {
    domain = subdomainMatch[1];
    filePath = path === '/' ? '/index.html' : path;
  } else if (path.length > 1) {
    const parts = path.split('/').filter(Boolean);
    const potential = parts[0];
    if (validateDomain(potential) && await resolveZipPath(potential)) {
      domain = potential;
      filePath = '/' + (parts.slice(1).join('/') || 'index.html');
    }
  }

  if (!domain) {
    return new Response('Not Found', { status: 404, headers: CORS });
  }

  if (!await extractSite(domain)) {
    return new Response('Site not found', { status: 404, headers: CORS });
  }

  const fullPath = `${SITES_DIR}/${domain}${filePath}`;
  try {
    const file = await Deno.open(fullPath);
    const ext = fullPath.split('.').pop() || '';
    const contentType = getContentType(ext);
    if (contentType === 'text/html') {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
        ?? req.headers.get('x-real-ip')
        ?? remoteAddr?.hostname
        ?? 'unknown';
      recordHit(domain, ip);
    }
    return new Response(file.readable, {
      headers: { ...CORS, 'Content-Type': contentType },
    });
  } catch {
    return new Response('File not found', { status: 404, headers: CORS });
  }
}

async function handler(req: Request, info: Deno.ServeHandlerInfo): Promise<Response> {
  const remoteAddr = info.remoteAddr as Deno.NetAddr;
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const url = new URL(req.url);
  const path = url.pathname;

  const isApiRoute =
    path === '/sites' ||
    path === '/upload' ||
    path === '/fetch-github' ||
    (path.startsWith('/sites/') && req.method !== 'GET') ||
    (path.startsWith('/sites/') && req.method === 'GET' && !/\/(icon|download)$/.test(path) && !/\/versions\/\d+\/download$/.test(path));
  if (isApiRoute) {
    const authError = requireAuth(req);
    if (authError) return authError;
  }

  // API routes
  if (path === '/health') return json({ status: 'healthy' });
  if (path === '/check-domain' && req.method === 'GET') {
    const domain = url.searchParams.get('domain') ?? '';
    const host = domain.replace(/\.petermichon\.fr$/, '');
    if (!validateDomain(host)) return new Response(null, { status: 404 });
    let exists = false;
    try {
      for await (const entry of Deno.readDir(SITES_DIR)) {
        if (entry.name.startsWith(`${host}@`) && entry.name.endsWith('.zip')) {
          exists = true; break;
        }
      }
    } catch { /* dir missing */ }
    return new Response(null, { status: exists ? 200 : 404 });
  }
  if (path === '/sites' && req.method === 'GET') return handleListSites();

  // Site-specific routes
  if (path.startsWith('/sites/')) {
    const parts = path.split('/').filter(Boolean);
    const domain = parts[1];
    const action = parts[2];

    if (req.method === 'GET') {
      if (!action) return handleGetSite(domain);
      if (action === 'download') return handleDownloadSite(domain);
      if (action === 'icon') return handleGetIcon(domain);
      if (action === 'meta') return handleGetMeta(domain);
      if (action === 'stats') {
        const slots = parseInt(url.searchParams.get('slots') ?? '60', 10);
        return handleGetStats(domain, isNaN(slots) ? 60 : slots);
      }
      if (action === 'visitors') return handleGetVisitors(domain);
      if (action === 'uptime') {
        const slots = parseInt(url.searchParams.get('slots') ?? '60', 10);
        return handleGetUptime(domain, isNaN(slots) ? 60 : slots);
      }
      if (action === 'repos') return handleGetRepoHistory(domain);
      if (action === 'versions') {
        const timestamp = parseInt(parts[3], 10);
        if (!isNaN(timestamp) && parts[4] === 'download') return handleDownloadVersion(domain, timestamp);
        return handleListVersions(domain);
      }
    }
    if (req.method === 'DELETE') {
      if (action === 'versions') {
        const timestamp = parseInt(parts[3], 10);
        if (isNaN(timestamp)) return error('Invalid timestamp');
        return handleDeleteVersion(domain, timestamp);
      }
      return handleDeleteSite(domain);
    }
    if (req.method === 'POST' && action === 'versions') {
      const timestamp = parseInt(parts[3], 10);
      if (isNaN(timestamp)) return error('Invalid timestamp');
      if (parts[4] === 'activate') return handleActivate(domain, timestamp);
    }
    if (req.method === 'PATCH' && action === 'toggle') return handleToggleSite(domain);
    if (req.method === 'PATCH' && action === 'meta') return handlePatchMeta(domain, req);
  }

  if (path === '/upload' && req.method === 'POST') {
    try {
      return await handleUpload(req);
    } catch (err) {
      console.error('Upload failed:', err);
      return error('Upload failed', 500);
    }
  }

  if (path === '/fetch-github' && req.method === 'POST') {
    try {
      return await handleFetchGitHub(req);
    } catch (err) {
      console.error('GitHub fetch failed:', err);
      return error('GitHub fetch failed', 500);
    }
  }

  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: CORS });

  return handleServeStatic(req, path, remoteAddr);
}

const port = parseInt(Deno.env.get('PORT') || '8080');
console.log(`Server running on http://localhost:${port}`);
Deno.serve({ port }, handler);
