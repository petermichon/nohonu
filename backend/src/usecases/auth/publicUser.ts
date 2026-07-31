import * as fs from 'node:fs/promises';
import * as users from '../../core/auth/users/index.ts';
import type { AuthUser } from './types.ts';

export async function getPublicUser(username: string): Promise<AuthUser | null> {
  const user = await users.getUserByUsername(username);
  if (!user) return null;
  return {
    username: user.username,
    displayName: user.displayName,
    profilePicture: user.profilePicture,
  };
}

export async function userExists(username: string): Promise<boolean> {
  const user = await users.getUserByUsername(username);
  return user !== null;
}

export async function getProfilePictureFile(username: string): Promise<Uint8Array | null> {
  const user = await users.getUserByUsername(username);
  if (!user || !user.profilePicture) return null;

  try {
    const profilePicturePath = users.getProfilePicturePath(username);
    return new Uint8Array(await fs.readFile(profilePicturePath));
  } catch {
    return null;
  }
}
