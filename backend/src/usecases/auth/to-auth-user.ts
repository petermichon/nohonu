import type { User } from '../../core/auth/users/user.ts';
import type { AuthUser } from './types.ts';

export function toAuthUser(user: User): AuthUser {
  return {
    username: user.username,
    displayName: user.displayName,
    profilePicture: user.profilePicture,
  };
}
