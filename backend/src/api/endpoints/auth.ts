import * as fs from 'node:fs/promises';
import { json, checkMethod, error } from '../../shared/http.ts';
import * as authUc from '../../usecases/auth/index.ts';
import * as loginUc from '../../usecases/auth/login.ts';
import * as logoutUc from '../../usecases/auth/logout.ts';
import * as meUc from '../../usecases/auth/me.ts';
import * as registerUc from '../../usecases/auth/register.ts';
import * as usersUc from '../../core/auth/users.ts';
import * as sessions from '../../core/auth/sessions.ts';

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

  const session = await sessions.getSession(sessionId);

  if (!session) {
    return json({ error: 'Invalid session' }, 401);
  }

  const body = await req.json().catch(() => ({}));
  const { displayName } = body;

  if (!displayName || typeof displayName !== 'string') {
    return json({ error: 'Display name required' }, 400);
  }

  if (displayName.length > 50) {
    return json({ error: 'Display name too long (max 50 characters)' }, 400);
  }

  try {
    await usersUc.updateDisplayName(session.username, displayName);
    return json({ success: true }, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Failed to update display name' }, 500);
  }
}

export async function uploadProfilePicture(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  const contentType = req.headers.get('Content-Type');
  if (!contentType?.startsWith('image/')) {
    return error('Invalid content type, must be an image', 400);
  }

  const body = await req.arrayBuffer();
  if (body.byteLength > 5_242_880) {
    return error('Image too large, max 5MB', 400);
  }

  try {
    const profilePicturePath = usersUc.getProfilePicturePath(username);
    await fs.writeFile(profilePicturePath, new Uint8Array(body));
    await usersUc.setProfilePicture(username);
    return json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return error(`Failed to upload profile picture: ${message}`, 500);
  }
}

export async function deleteProfilePicture(req: Request): Promise<Response> {
  const username = req.headers.get('X-Username');
  if (!username) {
    return error('Missing username', 401);
  }

  try {
    const profilePicturePath = usersUc.getProfilePicturePath(username);
    await fs.rm(profilePicturePath, { force: true });
    await usersUc.removeProfilePicture(username);
    return json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return error(`Failed to delete profile picture: ${message}`, 500);
  }
}

export async function getSessions(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'GET');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) {
    return json({ error: 'Session ID required' }, 400);
  }

  const session = await sessions.getSession(sessionId);
  if (!session) {
    return json({ error: 'Invalid session' }, 401);
  }

  const userSessions = await sessions.getUserSessions(session.username);

  return json({ sessions: userSessions });
}

export async function deleteSession(req: Request): Promise<Response> {
  const methodError = checkMethod(req, 'DELETE');
  if (methodError) return methodError;

  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) {
    return json({ error: 'Session ID required' }, 400);
  }

  const currentSession = await sessions.getSession(sessionId);
  if (!currentSession) {
    return json({ error: 'Invalid session' }, 401);
  }

  const url = new URL(req.url);
  const sessionToDelete = url.searchParams.get('id');
  if (!sessionToDelete) {
    return json({ error: 'Session ID to delete is required' }, 400);
  }

  if (sessionToDelete === sessionId) {
    return json({ error: 'Cannot delete current session, use logout instead' }, 400);
  }

  const targetSession = await sessions.getSession(sessionToDelete);
  if (!targetSession) {
    return json({ error: 'Session not found' }, 404);
  }

  if (targetSession.username !== currentSession.username) {
    return json({ error: 'Cannot delete sessions from other users' }, 403);
  }

  await sessions.deleteSession(sessionToDelete);

  return json({ success: true });
}
