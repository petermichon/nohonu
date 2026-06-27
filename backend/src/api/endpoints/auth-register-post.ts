import { json, checkMethod, requireAuth } from '../../shared/http.ts';
import * as registerUc from '../../usecases/auth/register.ts';

export async function authRegister(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'POST');
  if (methodError) return methodError;

  const authError = requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return json({ error: 'Email, password, and username are required' }, 400);
    }

    const ip = req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || undefined;
    const userAgent = req.headers.get('User-Agent') || undefined;

    const result = await registerUc.register(email, password, username, undefined, userAgent, ip);

    if (!result.success || !result.user) {
      return json({ error: result.error || 'Registration failed' }, 400);
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
      201,
    );
  } catch (_error) {
    return json({ error: 'Invalid request body' }, 400);
  }
}
