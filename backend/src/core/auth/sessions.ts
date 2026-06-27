// ponytail: per-user JSON file storage for sessions - simple, upgrade to KV/Redis if scale needed

import { SITES_DIR } from '../../shared/paths.ts';

function getUserSessionsFile(username: string): string {
  return `${SITES_DIR}/${username}/sessions.json`;
}

export interface Session {
  id: string;
  username: string;
  deviceInfo?: string;
  userAgent?: string;
  ip?: string;
  createdAt: number;
  lastActive: number;
}

interface SessionsData {
  sessions: Session[];
}

function loadUserSessions(username: string): SessionsData {
  try {
    const data = Deno.readTextFileSync(getUserSessionsFile(username));
    return JSON.parse(data);
  } catch {
    return { sessions: [] };
  }
}

function saveUserSessions(username: string, data: SessionsData): void {
  const userDir = `${SITES_DIR}/${username}`;
  try {
    Deno.mkdirSync(userDir, { recursive: true });
  } catch {
    // directory already exists
  }
  Deno.writeTextFileSync(getUserSessionsFile(username), JSON.stringify(data, null, 2));
}

export function createSession(username: string, deviceInfo?: string, userAgent?: string, ip?: string): Session {
  const data = loadUserSessions(username);
  const session: Session = {
    id: crypto.randomUUID(),
    username,
    deviceInfo,
    userAgent,
    ip,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };

  data.sessions.push(session);
  saveUserSessions(username, data);

  return session;
}

export async function getSession(id: string): Promise<Session | null> {
  // Need to scan all user directories to find the session
  // ponytail: inefficient but works for small scale, add index if needed
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.isDirectory) {
        const username = entry.name;
        const data = loadUserSessions(username);
        const session = data.sessions.find((s) => s.id === id);
        if (session) return session;
      }
    }
  } catch {
    // SITES_DIR doesn't exist or other error
  }
  return null;
}

export async function updateSessionActivity(id: string): Promise<void> {
  // Find which user owns this session
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.isDirectory) {
        const username = entry.name;
        const data = loadUserSessions(username);
        const session = data.sessions.find((s) => s.id === id);
        if (session) {
          session.lastActive = Date.now();
          saveUserSessions(username, data);
          return;
        }
      }
    }
  } catch {
    // SITES_DIR doesn't exist or other error
  }
}

export async function deleteSession(id: string): Promise<void> {
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.isDirectory) {
        const username = entry.name;
        const data = loadUserSessions(username);
        const filtered = data.sessions.filter((s) => s.id !== id);
        if (filtered.length !== data.sessions.length) {
          data.sessions = filtered;
          saveUserSessions(username, data);
          return;
        }
      }
    }
  } catch {
    // SITES_DIR doesn't exist or other error
  }
}

export function deleteAllUserSessions(username: string): void {
  const data = loadUserSessions(username);
  data.sessions = [];
  saveUserSessions(username, data);
}

export function getUserSessions(username: string): Session[] {
  const data = loadUserSessions(username);
  return data.sessions;
}

export async function cleanupExpiredSessions(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
  const now = Date.now();
  try {
    for await (const entry of Deno.readDir(SITES_DIR)) {
      if (entry.isDirectory) {
        const username = entry.name;
        const data = loadUserSessions(username);
        const filtered = data.sessions.filter((s) => now - s.lastActive < maxAgeMs);
        if (filtered.length !== data.sessions.length) {
          data.sessions = filtered;
          saveUserSessions(username, data);
        }
      }
    }
  } catch {
    // SITES_DIR doesn't exist or other error
  }
}
