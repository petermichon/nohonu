import type { AuthUser } from './auth-user.ts';

export interface RegisterResult {
  success: boolean;
  user?: AuthUser;
  session?: string;
  error?: string;
}
