import { error, json } from '../../shared/http.ts';
import { MAX_ZIP_BYTES } from '../../shared/paths.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function upload(req: Request, { domain }: RouteContext): Promise<Response> {
  const formData = await req.formData();
  const zipFile = formData.get('zip');

  if (!(zipFile instanceof File)) {
    return error('Missing zip file');
  }

  if (zipFile.size > MAX_ZIP_BYTES) {
    return error(`Zip file too large (max ${MAX_ZIP_BYTES} bytes)`, 413);
  }

  const buffer = await zipFile.arrayBuffer();
  const zipData = new Uint8Array(buffer);

  const result = await sites.uploadVersion(domain, zipData);

  const account = req.headers.get('X-Account');
  if (account) {
    await sites.setSiteAccount(domain, account);
  }

  return json({ success: true, domain, index: result.index });
}
