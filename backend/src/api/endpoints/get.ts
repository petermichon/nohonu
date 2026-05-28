import { readZip } from '../../shared/zip.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import { recordHit } from '../../services/analytics.ts';
import { readSiteMetadata } from '../../services/sites-folder.ts';
import { CORS } from '../../shared/http.ts';
import {
  extractedSiteExists,
  extractSite,
  readExtractedFile,
  readActiveVersion,
  versionExists,
} from '../../services/sites-folder.ts';

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

async function ensureSiteExtracted(domain: string): Promise<boolean> {
  const data = await readSiteMetadata(domain);
  if (!data) {
    return false;
  }

  if (await extractedSiteExists(domain)) {
    return true;
  }
  if (!data.enabled || data.currentIndex === null) {
    return false;
  }

  try {
    const zipData = await readActiveVersion(domain);
    if (!zipData) {
      return false;
    }
    const files = await readZip(zipData);
    await extractSite(domain, files);
    return true;
  } catch (err) {
    console.error('Extraction error:', err);
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
    if (VALID_DOMAIN.test(potential) && (await versionExists(potential, 1))) {
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

  if (!(await ensureSiteExtracted(domain))) {
    return new Response('Site not found', { status: 404, headers: CORS });
  }

  const file = await readExtractedFile(domain, filePath);
  if (!file) {
    return new Response('File not found', { status: 404, headers: CORS });
  }
  const parts = filePath.split('.');
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
