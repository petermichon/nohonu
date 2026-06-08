import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import type { RouteContext } from './sites-types.ts';

export async function upload(req: Request, { domain }: RouteContext): Promise<Response> {
  const formData = await req.formData();
  const zipFile = formData.get('zip');

  if (!(zipFile instanceof File)) {
    return error('Missing zip file');
  }

  const buffer = await zipFile.arrayBuffer();
  const zipData = new Uint8Array(buffer);

  const result = await sites.uploadVersion(domain, zipData);
  return json({ success: true, domain, index: result.index });
}
