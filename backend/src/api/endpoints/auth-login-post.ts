import { json, checkMethod, requireAuth } from '../../shared/http.ts';
import * as loginUc from '../../usecases/auth/login.ts';

export async function authLogin(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'POST');
  if (methodError) return methodError;

  const authError = requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, 400);
    }

    const ip = req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || undefined;
    const userAgent = req.headers.get('User-Agent') || undefined;

    const result = await loginUc.login(email, password, undefined, userAgent, ip);

    if (!result.success || !result.user) {
      return json({ error: result.error || 'Login failed' }, 401);
    }

    return json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          displayName: result.user.displayName,
        },
        session: result.session,
      },
      200,
    );
  } catch (_error) {
    return json({ error: 'Invalid request body' }, 400);
  }
}
