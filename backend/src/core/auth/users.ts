import { hashPassword, verifyPassword } from './password.ts';
import { db } from '../../db.ts';
import { SITES_DIR } from '../../shared/paths.ts';

const PROFILE_PICTURE_FILE = (username: string) => `${SITES_DIR}/${username}/profile.jpg`;

export interface User {
  passwordHash: string;
  username: string;
  displayName: string;
  createdAt: number;
  profilePicture?: string;
}

export async function createUser(password: string, username: string): Promise<User> {
  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    throw new Error('Username already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      username,
      passwordHash,
      displayName: username,
      createdAt: Date.now(),
    },
  });

  return {
    passwordHash: user.passwordHash,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt,
    profilePicture: user.profilePicture ?? undefined,
  };
}

export async function validateUser(username: string, password: string): Promise<User | null> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid
    ? {
        passwordHash: user.passwordHash,
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt,
        profilePicture: user.profilePicture ?? undefined,
      }
    : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return null;
  return {
    passwordHash: user.passwordHash,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt,
    profilePicture: user.profilePicture ?? undefined,
  };
}

export async function updateDisplayName(username: string, displayName: string): Promise<void> {
  await db.user.update({ where: { username }, data: { displayName } });
}

export async function setProfilePicture(username: string): Promise<void> {
  await db.user.update({ where: { username }, data: { profilePicture: 'profile.jpg' } });
}

export async function removeProfilePicture(username: string): Promise<void> {
  await db.user.update({ where: { username }, data: { profilePicture: null } });
}

export function getProfilePicturePath(username: string): string {
  return PROFILE_PICTURE_FILE(username);
}
