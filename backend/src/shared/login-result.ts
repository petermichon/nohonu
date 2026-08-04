import type { AuthUser } from './auth-user.ts';

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  session?: string;
  error?: string;
}
