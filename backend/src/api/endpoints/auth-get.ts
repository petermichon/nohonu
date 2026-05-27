import { json, API_KEY, checkMethod } from '../../shared/http.ts';

export function auth(req: Request): Response {
  const methodError = checkMethod(req, 'GET');
  if (methodError) {
    return methodError;
  }
  if (!API_KEY) {
    return json({ secured: false });
  }
  if (req.headers.get('X-Api-Key') === API_KEY) {
    return json({ secured: true, valid: true });
  } else {
    return json({ secured: true, valid: false }, 401);
  }
}
