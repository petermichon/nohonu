import { checkMethod } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';

export async function checkDomain(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return new Response(undefined, { status: 405 });

  const url = new URL(req.url);
  const rawDomain = url.searchParams.get('domain') ?? '';

  const exists = await sites.checkDomain(rawDomain);
  return new Response(undefined, { status: exists ? 200 : 404 });
}
