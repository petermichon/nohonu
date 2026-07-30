import { json, parseJson, requireSessionId, requireUsername } from '../../shared/http.ts';
import * as authUc from '../../usecases/auth/index.ts';
import * as authModule from '../../usecases/auth/auth.ts';
import * as profile from '../../usecases/auth/profile.ts';
import * as sessionUc from '../../usecases/auth/sessions.ts';

// === Params

type RegisterParams = { password: string; username: string; userAgent?: string };
async function extractRegisterParams(req: Request): Promise<RegisterParams | Response> {
  const body = await parseJson<{ password?: string; username?: string }>(req);
  if (body instanceof Response) return body;
  const password = body.password || '';
  const username = body.username || '';
  if (!password || !username) return json({ error: 'Password and username are required' }, 400);
  return { password, username, userAgent: req.headers.get('User-Agent') || undefined };
}

type LoginParams = { username: string; password: string; userAgent?: string };
async function extractLoginParams(req: Request): Promise<LoginParams | Response> {
  const body = await parseJson<{ username?: string; password?: string }>(req);
  if (body instanceof Response) return body;
  const username = body.username || '';
  const password = body.password || '';
  if (!username || !password) return json({ error: 'Username and password are required' }, 400);
  return { username, password, userAgent: req.headers.get('User-Agent') || undefined };
}

type DisplayNameParams = { sessionId: string; displayName: string };
async function extractDisplayNameParams(req: Request): Promise<DisplayNameParams | Response> {
  const sessionId = requireSessionId(req);
  if (sessionId instanceof Response) return sessionId;
  const body = await parseJson<{ displayName?: string }>(req);
  if (body instanceof Response) return body;
  const displayName = body.displayName;
  if (typeof displayName !== 'string' || !displayName) return json({ error: 'Display name required' }, 400);
  if (displayName.length > 50) return json({ error: 'Display name too long (max 50 characters)' }, 400);
  return { sessionId, displayName };
}

type UploadPictureParams = { username: string; contentType: string; data: ArrayBuffer };
async function extractUploadPictureParams(req: Request): Promise<UploadPictureParams | Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;
  const contentType = req.headers.get('Content-Type') || '';
  const data = await req.arrayBuffer();
  return { username, contentType, data };
}

type DeleteSessionParams = { sessionId: string; sessionToDelete: string };
function extractDeleteSessionParams(req: Request): DeleteSessionParams | Response {
  const sessionId = req.headers.get('X-Session-Id');
  if (!sessionId) return json({ error: 'Session ID required' }, 400);
  const url = new URL(req.url);
  const sessionToDelete = url.searchParams.get('id');
  if (!sessionToDelete) return json({ error: 'Session ID to delete is required' }, 400);
  return { sessionId, sessionToDelete };
}

// === Responses

function registerResponse(result: authModule.RegisterResult): Response {
  if (!result.success || !result.user) {
    return json({ error: result.error || 'Registration failed' }, 400);
  }
  return json({
    user: { username: result.user.username, displayName: result.user.displayName },
    session: result.session,
  }, 201);
}

function loginResponse(result: authModule.LoginResult): Response {
  if (!result.success || !result.user) {
    return json({ error: result.error || 'Login failed' }, 401);
  }
  return json({
    user: { username: result.user.username, displayName: result.user.displayName },
    session: result.session,
  }, 200);
}

function meResponse(result: authModule.MeResult): Response {
  if (result.error || !result.user) {
    return json({ error: result.error || 'User not found' }, 401);
  }
  return json({
    user: {
      username: result.user.username,
      displayName: result.user.displayName,
      profilePicture: result.user.profilePicture,
    },
    session: result.session,
  }, 200);
}

function sessionsResponse(result: sessionUc.ListSessionsResult | { success: false; error: string; status: number }): Response {
  if (!result.success) return json({ error: result.error }, result.status);
  return json({ sessions: result.sessions });
}

function deleteSessionResponse(result: sessionUc.DeleteSessionResult): Response {
  if (!result.success) return json({ error: result.error }, result.status ?? 400);
  return json({ success: true });
}

function profileResponse(result: profile.ProfileResult, status = 400): Response {
  if (!result.success) return json({ error: result.error }, status);
  return json({ success: true });
}

// === Handlers

export function auth(req: Request): Response {
  const key = req.headers.get('X-Api-Key');
  const result = authUc.checkAuth(key);
  return json(result, result.secured && !result.valid ? 401 : 200);
}

export async function authRegister(req: Request): Promise<Response> {
  const params = await extractRegisterParams(req);
  if (params instanceof Response) return params;
  const result = await authModule.register(params.password, params.username, params.userAgent);
  return registerResponse(result);
}

export async function authLogin(req: Request): Promise<Response> {
  const params = await extractLoginParams(req);
  if (params instanceof Response) return params;
  const result = await authModule.login(params.username, params.password, params.userAgent);
  return loginResponse(result);
}

export async function authLogout(req: Request): Promise<Response> {
  const sessionId = requireSessionId(req);
  if (sessionId instanceof Response) return sessionId;
  await authModule.logout(sessionId);
  return json({ success: true }, 200);
}

export async function authMe(req: Request): Promise<Response> {
  const sessionId = requireSessionId(req);
  if (sessionId instanceof Response) return sessionId;
  const result = await authModule.me(sessionId);
  return meResponse(result);
}

export async function authDisplayName(req: Request): Promise<Response> {
  const params = await extractDisplayNameParams(req);
  if (params instanceof Response) return params;
  const result = await profile.updateDisplayName(params.sessionId, params.displayName);
  return profileResponse(result, 401);
}

export async function uploadProfilePicture(req: Request): Promise<Response> {
  const params = await extractUploadPictureParams(req);
  if (params instanceof Response) return params;
  const result = await profile.uploadProfilePicture(params.username, params.contentType, params.data);
  return profileResponse(result);
}

export async function deleteProfilePicture(req: Request): Promise<Response> {
  const username = requireUsername(req);
  if (username instanceof Response) return username;
  const result = await profile.deleteProfilePicture(username);
  return profileResponse(result, 500);
}

export async function getSessions(req: Request): Promise<Response> {
  const sessionId = requireSessionId(req);
  if (sessionId instanceof Response) return sessionId;
  const result = await sessionUc.listSessions(sessionId);
  return sessionsResponse(result);
}

export async function deleteSession(req: Request): Promise<Response> {
  const params = extractDeleteSessionParams(req);
  if (params instanceof Response) return params;
  const result = await sessionUc.deleteSession(params.sessionId, params.sessionToDelete);
  return deleteSessionResponse(result);
}
