import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json, parseJson, requireSessionId } from '../../shared/express/http.ts';
import { sendUsecaseError } from '../errors.ts';
import { checkAuth } from '../../usecases/apikey/check-auth.ts';
import { login } from '../../usecases/auth/login.ts';
import { register } from '../../usecases/auth/register.ts';
import { logout } from '../../usecases/auth/logout.ts';
import { me } from '../../usecases/auth/me.ts';
import { updateDisplayName } from '../../usecases/auth/update-display-name.ts';
import { uploadProfilePicture as uploadProfilePictureUsecase } from '../../usecases/auth/upload-profile-picture.ts';
import { deleteProfilePicture as deleteProfilePictureUsecase } from '../../usecases/auth/delete-profile-picture.ts';
import { listSessions } from '../../usecases/auth/list-sessions.ts';
import { deleteSession as deleteSessionUsecase } from '../../usecases/auth/delete-session.ts';
import type { LoginResult, MeResult, RegisterResult } from '../../usecases/auth/types.ts';

// === Params

type RegisterParams = { password: string; username: string; userAgent?: string };
async function extractRegisterParams(req: ExpressReq): Promise<RegisterParams | undefined> {
  const body = await parseJson<{ password?: string; username?: string }>(req);
  if (!body) return undefined;
  if (!body.password || !body.username) return undefined;
  return { password: body.password, username: body.username, userAgent: req.get('User-Agent') || undefined };
}

type LoginParams = { username: string; password: string; userAgent?: string };
async function extractLoginParams(req: ExpressReq): Promise<LoginParams | undefined> {
  const body = await parseJson<{ username?: string; password?: string }>(req);
  if (!body) return undefined;
  if (!body.username || !body.password) return undefined;
  return { username: body.username, password: body.password, userAgent: req.get('User-Agent') || undefined };
}

type DisplayNameParams = { sessionId: string; displayName: string };
async function extractDisplayNameParams(req: ExpressReq): Promise<DisplayNameParams | undefined> {
  const sessionId = requireSessionId(req);
  if (!sessionId) return undefined;
  const body = await parseJson<{ displayName?: string }>(req);
  if (!body || typeof body.displayName !== 'string' || !body.displayName || body.displayName.length > 50)
    return undefined;
  return { sessionId, displayName: body.displayName };
}

// === Responses

function registerResponse(res: ExpressRes, result: RegisterResult): void {
  if (!result.success || !result.user) {
    json(res, { error: result.error || 'Registration failed' }, 400);
    return;
  }
  json(
    res,
    {
      user: { username: result.user.username, displayName: result.user.displayName },
      session: result.session,
    },
    201,
  );
}

function loginResponse(res: ExpressRes, result: LoginResult): void {
  if (!result.success || !result.user) {
    json(res, { error: result.error || 'Login failed' }, 401);
    return;
  }
  json(
    res,
    {
      user: { username: result.user.username, displayName: result.user.displayName },
      session: result.session,
    },
    200,
  );
}

function meResponse(res: ExpressRes, result: MeResult): void {
  if (result.error || !result.user) {
    json(res, { error: result.error || 'User not found' }, 401);
    return;
  }
  json(
    res,
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

// === Handlers

export function auth(req: ExpressReq, res: ExpressRes): void {
  const key = req.get('X-Api-Key') || null;
  const result = checkAuth(key);
  json(res, result, result.secured && !result.valid ? 401 : 200);
}

export async function authRegister(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractRegisterParams(req);
  if (!params) {
    json(res, { error: 'Password and username are required' }, 400);
    return;
  }
  const result = await register(params.password, params.username, params.userAgent);
  registerResponse(res, result);
}

export async function authLogin(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractLoginParams(req);
  if (!params) {
    json(res, { error: 'Username and password are required' }, 400);
    return;
  }
  const result = await login(params.username, params.password, params.userAgent);
  loginResponse(res, result);
}

export async function authLogout(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = requireSessionId(req);
  if (!sessionId) {
    json(res, { error: 'Session ID required' }, 401);
    return;
  }
  await logout(sessionId);
  json(res, { success: true }, 200);
}

export async function authMe(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = requireSessionId(req);
  if (!sessionId) {
    json(res, { error: 'Session ID required' }, 401);
    return;
  }
  const result = await me(sessionId);
  meResponse(res, result);
}

export async function authDisplayName(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractDisplayNameParams(req);
  if (!params) {
    json(res, { error: 'Display name required' }, 400);
    return;
  }
  const result = await updateDisplayName(params.sessionId, params.displayName);
  if (!result.success) {
    json(res, { error: result.error || 'Failed to update display name' }, 401);
    return;
  }
  json(res, { success: true }, 200);
}

export async function uploadProfilePicture(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  const contentType = req.get('Content-Type') || '';
  const raw = req.body instanceof Buffer ? req.body : Buffer.alloc(0);
  const result = await uploadProfilePictureUsecase(
    sessionId,
    contentType,
    raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength),
  );
  if (!result.success) {
    json(res, { error: result.error }, 400);
    return;
  }
  json(res, { success: true });
}

export async function deleteProfilePicture(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id') || '';
  const result = await deleteProfilePictureUsecase(sessionId);
  if (!result.success) {
    json(res, { error: result.error }, 500);
    return;
  }
  json(res, { success: true });
}

export async function getSessions(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = requireSessionId(req);
  if (!sessionId) {
    json(res, { error: 'Session ID required' }, 400);
    return;
  }
  const result = await listSessions(sessionId);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { sessions: result.value });
}

export async function deleteSession(req: ExpressReq, res: ExpressRes): Promise<void> {
  const sessionId = req.get('X-Session-Id');
  if (!sessionId) {
    json(res, { error: 'Session ID required' }, 400);
    return;
  }
  const sessionToDelete = req.query.id as string;
  if (!sessionToDelete) {
    json(res, { error: 'Session ID to delete is required' }, 400);
    return;
  }
  const result = await deleteSessionUsecase(sessionId, sessionToDelete);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  json(res, { success: true });
}
