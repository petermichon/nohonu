import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import { SITES_DIR } from '../../shared/paths.ts';

function getUserSessionsFile(username: string): string {
  return `${SITES_DIR}/${username}/sessions.json`;
}

export interface Session {
  id: string;
  username: string;
  userAgent?: string;
  deviceInfo?: string;
  createdAt: number;
  lastActive: number;
}

interface SessionsData {
  sessions: Session[];
}

function loadUserSessions(username: string): SessionsData {
  try {
    const data = fs.readFileSync(getUserSessionsFile(username), 'utf-8');
    return JSON.parse(data);
  } catch {
    // ignore
    return { sessions: [] };
  }
}

function saveUserSessions(username: string, data: SessionsData): void {
  const userDir = `${SITES_DIR}/${username}`;
  try {
    fs.mkdirSync(userDir, { recursive: true });
  } catch {
    // ignore

  }
  fs.writeFileSync(getUserSessionsFile(username), JSON.stringify(data, null, 2));
}

export function createSession(username: string, userAgent?: string): Session {
  const data = loadUserSessions(username);
  const session: Session = {
    id: crypto.randomUUID(),
    username,
    userAgent,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };

  data.sessions.push(session);
  saveUserSessions(username, data);

  return session;
}

async function scanAllUsers(): Promise<string[]> {
  const users: string[] = [];
  try {
    const entries = await fsp.readdir(SITES_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        users.push(entry.name);
      }
    }
  } catch {
    // ignore

  }
  return users;
}

export async function getSession(id: string): Promise<Session | null> {
  try {
    const users = await scanAllUsers();
    for (const username of users) {
      const data = loadUserSessions(username);
      const session = data.sessions.find((s) => s.id === id);
      if (session) return session;
    }
  } catch {
    // ignore

  }
  return null;
}

export async function updateSessionActivity(id: string): Promise<void> {
  try {
    const users = await scanAllUsers();
    for (const username of users) {
      const data = loadUserSessions(username);
      const session = data.sessions.find((s) => s.id === id);
      if (session) {
        session.lastActive = Date.now();
        saveUserSessions(username, data);
        return;
      }
    }
  } catch {
    // ignore

  }
}

export async function deleteSession(id: string): Promise<void> {
  try {
    const users = await scanAllUsers();
    for (const username of users) {
      const data = loadUserSessions(username);
      const filtered = data.sessions.filter((s) => s.id !== id);
      if (filtered.length !== data.sessions.length) {
        data.sessions = filtered;
        saveUserSessions(username, data);
        return;
      }
    }
  } catch {
    // ignore

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
    const users = await scanAllUsers();
    for (const username of users) {
      const data = loadUserSessions(username);
      const filtered = data.sessions.filter((s) => now - s.lastActive < maxAgeMs);
      if (filtered.length !== data.sessions.length) {
        data.sessions = filtered;
        saveUserSessions(username, data);
      }
    }
  } catch {
    // ignore

  }
}
