import type { Request } from 'express';
import { SUBDOMAIN_BASE } from '../config.ts';

// Public GET endpoints that must be reachable without the server password.
// These serve public assets (profile pictures, site covers, site icons) that
// are fetched via plain <img> tags, which cannot send custom headers.
const PUBLIC_IMAGE_PATHS = [
  '/users/:username/profile-picture',
  '/users/:username/sites/:siteId/cover',
  '/users/:username/sites/:siteId/icon',
];

export function isPublicImageRequest(req: Request): boolean {
  if (req.method !== 'GET') return false;
  const fullPath = `${req.baseUrl ?? ''}${req.path ?? ''}`;
  const path = fullPath.split('?')[0] ?? '';
  for (const pattern of PUBLIC_IMAGE_PATHS) {
    const parts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);
    if (parts.length !== pathParts.length) continue;
    let matches = true;
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      const pathPart = pathParts[i];
      if (!part || !pathPart) break;
      if (part.startsWith(':')) continue;
      if (part !== pathPart) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }
  return false;
}

export function isSubdomainSiteRequest(req: Request): boolean {
  const host = (req.get('Host') ?? '').replace(/:\d+$/, '').toLowerCase();
  const base = SUBDOMAIN_BASE.replace(/^https?:\/\//, '').replace(/:\d+$/, '').toLowerCase();
  return req.method === 'GET' && host.length > base.length && host.endsWith(`.${base}`);
}
