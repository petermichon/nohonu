import { json, checkMethod } from '../../shared/http.ts';
import * as authUc from '../../usecases/auth/index.ts';
import * as loginUc from '../../usecases/auth/login.ts';
import * as logoutUc from '../../usecases/auth/logout.ts';
import * as meUc from '../../usecases/auth/me.ts';
import * as registerUc from '../../usecases/auth/register.ts';
import * as displayNameUc from '../../usecases/auth/updateDisplayName.ts';
import * as sessionUc from '../../usecases/auth/sessions.ts';
import * as profilePictureUc from '../../usecases/auth/profilePicture.ts';

export function auth(req: Request): Response {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const result = authUc.checkAuth(req.headers.get('X-Api-Key'));
  const status = result.secured && !result.valid ? 401 : 200;
  return json(result, status);
}

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

export async function authLogin(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'POST');
  if (methodError) return methodError;

  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return json({ error: 'Username and password are required' }, 400);
    }

    const userAgent = req.headers.get('User-Agent') || undefined;

    const result = await loginUc.login(username, password, userAgent);

    if (!result.success || !result.user) {
      return json({ error: result.error || 'Login failed' }, 401);
    }

    return json(
      {
        user: {
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

export async function authLogout(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'POST');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');

  if (!sessionId) {
    return json({ error: 'Session ID required' }, 400);
  }

  await logoutUc.logout(sessionId);

  return json({ success: true }, 200);
}

export async function authMe(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');

  if (!sessionId) {
    return json({ error: 'Session ID required' }, 401);
  }

  const result = await meUc.me(sessionId);

  if (result.error || !result.user) {
    return json({ error: result.error || 'User not found' }, 401);
  }

  return json(
    {
      user: {
        username: result.user.username,
        displayName: result.user.displayName,
        profilePicture: result.user.profilePicture,
      },
      session: result.session,
    },
    200,
  );
}

export async function authDisplayName(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'PATCH');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) {
    return json({ error: 'Session ID required' }, 401);
  }

  const body = await req.json().catch(() => ({}));
  const { displayName } = body;

  if (!displayName || typeof displayName !== 'string') {
    return json({ error: 'Display name required' }, 400);
  }

  if (displayName.length > 50) {
    return json({ error: 'Display name too long (max 50 characters)' }, 400);
  }

  const result = await displayNameUc.updateDisplayName(sessionId, displayName);
  if (!result.success) {
    return json({ error: result.error || 'Failed to update display name' }, 401);
  }

  return json({ success: true }, 200);
}

export async function uploadProfilePicture(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return json({ error: 'Missing username' }, 401);
  }

  const contentType = req.headers.get('Content-Type') || '';
  const body = await req.arrayBuffer();

  const result = await profilePictureUc.uploadProfilePicture(username, contentType, body);
  if (!result.success) {
    return json({ error: result.error }, 400);
  }

  return json({ success: true });
}

export async function deleteProfilePicture(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return json({ error: 'Missing username' }, 401);
  }

  const result = await profilePictureUc.deleteProfilePicture(username);
  if (!result.success) {
    return json({ error: result.error }, 500);
  }

  return json({ success: true });
}

export async function getSessions(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) {
    return json({ error: 'Session ID required' }, 400);
  }

  const result = await sessionUc.listSessions(sessionId);
  if (!result.success) {
    return json({ error: result.error }, result.status);
  }

  return json({ sessions: result.sessions });
}

export async function deleteSession(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'DELETE');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) {
    return json({ error: 'Session ID required' }, 400);
  }

  const url = new URL(req.url);
  const sessionToDelete = url.searchParams.get('id');
  if (!sessionToDelete) {
    return json({ error: 'Session ID to delete is required' }, 400);
  }

  const result = await sessionUc.deleteSession(sessionId, sessionToDelete);
  if (!result.success) {
    return json({ error: result.error }, result.status ?? 400);
  }

  return json({ success: true });
}
