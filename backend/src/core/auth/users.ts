// ponytail: JSON file storage - simple, no database dependency, upgrade to KV/Postgres if scale needed

import { hashPassword, verifyPassword } from './password.ts';
import { SITES_DIR } from '../../shared/paths.ts';

const USER_FILE = (username: string) => `${SITES_DIR}/${username}/user.json`;
const PROFILE_PICTURE_FILE = (username: string) => `${SITES_DIR}/${username}/profile.jpg`;

export interface User {
  passwordHash: string;
  username: string;
  displayName: string;
  createdAt: number;
  profilePicture?: string;
}

function loadUserFile(username: string): User | null {
  try {
    const data = Deno.readTextFileSync(USER_FILE(username));
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveUserFile(username: string, user: User): void {
  const userDir = `${SITES_DIR}/${username}`;
  Deno.mkdirSync(userDir, { recursive: true });
  Deno.writeTextFileSync(USER_FILE(username), JSON.stringify(user, null, 2));
}

export async function createUser(password: string, username: string): Promise<User> {
  // Check username uniqueness
  if (loadUserFile(username)) {
    throw new Error('Username already exists');
  }

  const passwordHash = await hashPassword(password);
  const user: User = {
    passwordHash,
    username,
    displayName: username,
    createdAt: Date.now(),
  };

  saveUserFile(username, user);

  return user;
}

export async function validateUser(username: string, password: string): Promise<User | null> {
  const user = loadUserFile(username);
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export function getUserByUsername(username: string): User | null {
  return loadUserFile(username);
}

export function updateDisplayName(username: string, displayName: string): void {
  const user = loadUserFile(username);
  if (!user) {
    throw new Error('User not found');
  }
  user.displayName = displayName;
  saveUserFile(username, user);
}

export function setProfilePicture(username: string): void {
  const user = loadUserFile(username);
  if (!user) {
    throw new Error('User not found');
  }
  user.profilePicture = 'profile.jpg';
  saveUserFile(username, user);
}

export function removeProfilePicture(username: string): void {
  const user = loadUserFile(username);
  if (!user) {
    throw new Error('User not found');
  }
  user.profilePicture = undefined;
  saveUserFile(username, user);
}

export function getProfilePicturePath(username: string): string {
  return PROFILE_PICTURE_FILE(username);
}
