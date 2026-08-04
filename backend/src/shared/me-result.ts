import type { AuthUser } from './auth-user.ts';
import type { MeSessionInfo } from './me-session-info.ts';

export interface MeResult {
  user?: AuthUser;
  session?: MeSessionInfo;
  error?: string;
}
