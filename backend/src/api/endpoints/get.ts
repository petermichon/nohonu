import { readZip } from '../../shared/zip.ts';
import { SITES_DIR, fileExists, VALID_DOMAIN } from '../../shared/paths.ts';
import { recordHit } from '../../services/analytics.ts';
import { resolveZipPath } from '../../services/versions.ts';
import { CORS } from '../../shared/http.ts';

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
  return types[ext] ?? 'application/octet-stream';
}

async function extractSite(domain: string): Promise<boolean> {
  const siteDir = `${SITES_DIR}/${domain}`;
  const zipPath = await resolveZipPath(domain);

  if (await fileExists(siteDir)) {
    return true;
  }
  if (!zipPath) {
    return false;
  }

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
    try {
      await Deno.remove(siteDir, { recursive: true });
    } catch {
      /* already gone */
    }
    return false;
  }
}

export async function serveStatic(req: Request, path: string, info: Deno.ServeHandlerInfo): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  const remoteAddr = info.remoteAddr as Deno.NetAddr;
  const hostRaw = req.headers.get('Host');
  const host = hostRaw ?? '';
  const subdomainMatch = host.match(/^([^.]+)\./);

  let domain: string | undefined;
  let filePath = path;

  if (subdomainMatch && !['www', 'localhost'].includes(subdomainMatch[1])) {
    domain = subdomainMatch[1];
    if (path === '/') {
      filePath = '/index.html';
    } else {
      filePath = path;
    }
  } else if (path.length > 1) {
    const parts = path.split('/').filter(Boolean);
    const potential = parts[0];
    if (VALID_DOMAIN.test(potential) && (await resolveZipPath(potential))) {
      domain = potential;
      const rest = parts.slice(1).join('/');
      let restOrIndex: string;
      if (rest !== '') {
        restOrIndex = rest;
      } else {
        restOrIndex = 'index.html';
      }
      filePath = '/' + restOrIndex;
    }
  }

  if (!domain) {
    return new Response('Not Found', { status: 404, headers: CORS });
  }

  if (!(await extractSite(domain))) {
    return new Response('Site not found', { status: 404, headers: CORS });
  }

  const fullPath = `${SITES_DIR}/${domain}${filePath}`;
  let file: Deno.FsFile;
  try {
    file = await Deno.open(fullPath);
  } catch {
    return new Response('File not found', { status: 404, headers: CORS });
  }
  const parts = fullPath.split('.');
  const extRaw = parts.pop();
  const ext = extRaw ?? '';
  const contentType = getContentType(ext);
  if (contentType === 'text/html') {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    let ip: string;
    if (forwarded) {
      const first = forwarded.split(',')[0];
      ip = first.trim();
    } else if (realIp) {
      ip = realIp;
    } else if (remoteAddr?.hostname) {
      ip = remoteAddr.hostname;
    } else {
      ip = 'unknown';
    }
    recordHit(domain, ip);
  }
  const responseHeaders = { ...CORS, 'Content-Type': contentType };
  return new Response(file.readable, { headers: responseHeaders });
}
