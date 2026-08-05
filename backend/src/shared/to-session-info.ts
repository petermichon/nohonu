import type { SessionInfo } from './session-info.ts';

export function toSessionInfo(session: {
  id: string;
  username: string;
  userAgent: string | null;
  deviceInfo: string | null;
  createdAt: number;
  lastActive: number;
}): SessionInfo {
  return {
    id: session.id,
    username: session.username,
    userAgent: session.userAgent ?? undefined,
    deviceInfo: session.deviceInfo ?? undefined,
    createdAt: session.createdAt,
    lastActive: session.lastActive,
  };
}
