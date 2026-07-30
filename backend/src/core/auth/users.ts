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

// ponytail: PBKDF2 with SHA-256, 100k iterations - secure enough for web app, upgrade to argon2 if needed

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, ['deriveBits']);

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  );

  const hash = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);

  return btoa(String.fromCharCode(...combined));
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0));

  const salt = combined.slice(0, 16);
  const storedHashBytes = combined.slice(16);

  const key = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, ['deriveBits']);

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  );

  const hash = new Uint8Array(derivedBits);

  if (hash.length !== storedHashBytes.length) return false;

  for (let i = 0; i < hash.length; i++) {
    if (hash[i] !== storedHashBytes[i]) return false;
  }

  return true;
}
