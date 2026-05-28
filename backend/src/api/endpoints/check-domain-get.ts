import { checkMethod, ensureDomain } from '../../shared/http.ts';
import { readSiteMetadata, readActiveVersion } from '../../services/sites-folder.ts';

export async function checkDomain(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) {
    return new Response(undefined, { status: 405 });
  }

  const url = new URL(req.url);
  const rawDomain = url.searchParams.get('domain') ?? '';
  const host = rawDomain.replace(/\.petermichon\.fr$/, '');

  const validDomain = ensureDomain(host);
  if (validDomain instanceof Response) {
    return new Response(undefined, { status: 404 });
  }

  const data = await readSiteMetadata(validDomain);
  if (!data || data.currentIndex === null) {
    return new Response(undefined, { status: 404 });
  }
  const version = await readActiveVersion(validDomain);
  if (!version) {
    return new Response(undefined, { status: 404 });
  }
  return new Response(undefined, { status: 200 });
}
