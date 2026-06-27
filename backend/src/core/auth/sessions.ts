// ponytail: JSON file storage for sessions - simple, upgrade to KV/Redis if scale needed

import { SITES_DIR } from '../../shared/paths.ts';

const SESSIONS_FILE = `${SITES_DIR}/sessions.json`;

export interface Session {
  id: string;
  userId: string;
  deviceInfo?: string;
  userAgent?: string;
  ip?: string;
  createdAt: number;
  lastActive: number;
}

interface SessionsData {
  sessions: Session[];
}

function loadSessions(): SessionsData {
  try {
    const data = Deno.readTextFileSync(SESSIONS_FILE);
    return JSON.parse(data);
  } catch {
    return { sessions: [] };
  }
}

function saveSessions(data: SessionsData): void {
  Deno.writeTextFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
}

export function createSession(userId: string, deviceInfo?: string, userAgent?: string, ip?: string): Session {
  const data = loadSessions();
  const session: Session = {
    id: crypto.randomUUID(),
    userId,
    deviceInfo,
    userAgent,
    ip,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };

  data.sessions.push(session);
  saveSessions(data);

  return session;
}

export function getSession(id: string): Session | null {
  const data = loadSessions();
  return data.sessions.find((s) => s.id === id) ?? null;
}

export function updateSessionActivity(id: string): void {
  const data = loadSessions();
  const session = data.sessions.find((s) => s.id === id);
  if (session) {
    session.lastActive = Date.now();
    saveSessions(data);
  }
}

export function deleteSession(id: string): void {
  const data = loadSessions();
  data.sessions = data.sessions.filter((s) => s.id !== id);
  saveSessions(data);
}

export function deleteAllUserSessions(userId: string): void {
  const data = loadSessions();
  data.sessions = data.sessions.filter((s) => s.userId !== userId);
  saveSessions(data);
}

export function getUserSessions(userId: string): Session[] {
  const data = loadSessions();
  return data.sessions.filter((s) => s.userId === userId);
}

export function cleanupExpiredSessions(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): void {
  const data = loadSessions();
  const now = Date.now();
  data.sessions = data.sessions.filter((s) => now - s.lastActive < maxAgeMs);
  saveSessions(data);
}
