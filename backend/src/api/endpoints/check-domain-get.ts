import { checkMethod, ensureDomain } from '../../shared/http.ts';
import { resolveZipPath } from '../../services/versions.ts';

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

  const zipPath = await resolveZipPath(validDomain);
  if (zipPath) {
    return new Response(undefined, { status: 200 });
  } else {
    return new Response(undefined, { status: 404 });
  }
}
