import { saveZipAsVersion } from '../../services/versions.ts';
import { error, json } from '../../shared/http.ts';
import type { RouteContext } from './sites-types.ts';

export async function upload(req: Request, { domain }: RouteContext): Promise<Response> {
  const formData = await req.formData();
  const zipFile = formData.get('zip');

  if (!(zipFile instanceof File)) {
    return error('Missing zip file');
  }

  const buffer = await zipFile.arrayBuffer();
  const result = await saveZipAsVersion(domain, new Uint8Array(buffer), { type: 'upload' });
  return json(result);
}
