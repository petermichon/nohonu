import * as users from '../../core/auth/users.ts';
import * as sessions from '../../core/auth/sessions.ts';
import type { User } from '../../core/auth/users.ts';

export interface LoginResult {
  success: boolean;
  user?: User;
  session?: string;
  error?: string;
}

export async function login(
  email: string,
  password: string,
  deviceInfo?: string,
  userAgent?: string,
  ip?: string
): Promise<LoginResult> {
  const user = await users.validateUser(email, password);
  
  if (!user) {
    return {
      success: false,
      error: 'Invalid email or password'
    };
  }
  
  const session = sessions.createSession(user.id, deviceInfo, userAgent, ip);
  
  return {
    success: true,
    user,
    session: session.id
  };
}
