import { json, checkMethod } from '../../shared/http.ts';
import * as registerUc from '../../usecases/auth/register.ts';

export async function authRegister(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'POST');
  if (methodError) return methodError;

  try {
    const body = await req.json();
    const { password, username } = body;

    if (!password || !username) {
      return json({ error: 'Password and username are required' }, 400);
    }

    const userAgent = req.headers.get('User-Agent') || undefined;

    const result = await registerUc.register(password, username, userAgent);

    if (!result.success || !result.user) {
      return json({ error: result.error || 'Registration failed' }, 400);
    }

    return json(
      {
        user: {
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
