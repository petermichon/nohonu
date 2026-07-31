import { getUserByUsername } from '../../core/auth/users/get-user-by-username.ts';
import type { AuthUser } from './types.ts';

export async function getPublicUser(username: string): Promise<AuthUser | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;
  return {
    username: user.username,
    displayName: user.displayName,
    profilePicture: user.profilePicture,
  };
}
