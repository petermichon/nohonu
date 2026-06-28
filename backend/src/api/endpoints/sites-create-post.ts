import { error, json } from '../../shared/http.ts';
import { MAX_ZIP_BYTES } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function createSite(req: Request, { domain }: RouteContext): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const formData = await req.formData();
  const zipFile = formData.get('zip');
  const subdomain = formData.get('subdomain') as string | null;

  if (!(zipFile instanceof File)) {
    return error('Missing zip file');
  }

  if (zipFile.size > MAX_ZIP_BYTES) {
    return error(`Zip file too large (max ${MAX_ZIP_BYTES} bytes)`, 413);
  }

  const buffer = await zipFile.arrayBuffer();
  const zipData = new Uint8Array(buffer);

  try {
    const result = await sites.createSite(username, domain, zipData);
    await sites.setSiteAccount(username, domain, username);
    // Set custom subdomain if provided
    if (subdomain) {
      await sites.updateSiteMeta(username, domain, { subdomain });
    }
    return json({ success: true, domain, index: result.index }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create site';
    return error(message, message === 'Domain already exists for this user' ? 409 : 500);
  }
}
