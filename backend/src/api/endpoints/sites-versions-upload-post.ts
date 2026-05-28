import {
  readSiteMetadata,
  writeSiteMetadata,
  versionPath,
  versionsDir,
  domainDir,
} from '../../services/sites-folder.ts';
import { error, json } from '../../shared/http.ts';
import { DEFAULT_DATA } from '../../services/sites-folder.ts';
import type { RouteContext } from './sites-types.ts';

export async function upload(req: Request, { domain }: RouteContext): Promise<Response> {
  const formData = await req.formData();
  const zipFile = formData.get('zip');

  if (!(zipFile instanceof File)) {
    return error('Missing zip file');
  }

  const buffer = await zipFile.arrayBuffer();
  const zipData = new Uint8Array(buffer);

  const existingData = await readSiteMetadata(domain);
  const data = existingData ?? { ...DEFAULT_DATA };
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  if (data.currentIndex === null) {
    data.currentIndex = index;
  }

  try {
    await Deno.mkdir(domainDir(domain), { recursive: true });
    await Deno.mkdir(versionsDir(domain), { recursive: true });
    await Deno.writeFile(versionPath(domain, index), zipData);
    // Write metadata after zip file (validation requires file to exist)
    await writeSiteMetadata(domain, data);
  } catch (err) {
    console.error('Upload failed:', err);
    return error('Failed to save version', 500);
  }

  return json({ success: true, domain, index });
}
