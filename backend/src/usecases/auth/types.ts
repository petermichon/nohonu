import type { AuthUser } from '../../shared/auth-user.ts';

export type { AuthUser };

export interface SessionInfo {
  id: string;
  username: string;
  userAgent?: string;
  deviceInfo?: string;
  createdAt: number;
  lastActive: number;
}

export interface MeSessionInfo {
  id: string;
  deviceInfo?: string;
  userAgent?: string;
  createdAt: number;
  lastActive: number;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  session?: string;
  error?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: AuthUser;
  session?: string;
  error?: string;
}

export interface MeResult {
  user?: AuthUser;
  session?: MeSessionInfo;
  error?: string;
}

export interface ProfileResult {
  success: boolean;
  error?: string;
}
