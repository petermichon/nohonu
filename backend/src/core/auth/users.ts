// ponytail: JSON file storage - simple, no database dependency, upgrade to KV/Postgres if scale needed

import { hashPassword, verifyPassword } from './password.ts';
import { SITES_DIR } from '../../shared/paths.ts';

const EMAIL_INDEX_FILE = `${SITES_DIR}/email-index.json`;
const USER_FILE = (username: string) => `${SITES_DIR}/${username}/user.json`;

export interface User {
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
  createdAt: number;
}

interface EmailIndex {
  [email: string]: string; // email -> username mapping
}

function loadEmailIndex(): EmailIndex {
  try {
    const data = Deno.readTextFileSync(EMAIL_INDEX_FILE);
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveEmailIndex(index: EmailIndex): void {
  Deno.writeTextFileSync(EMAIL_INDEX_FILE, JSON.stringify(index, null, 2));
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

export async function createUser(email: string, password: string, username: string): Promise<User> {
  const emailIndex = loadEmailIndex();

  // Check email uniqueness
  if (emailIndex[email]) {
    throw new Error('Email already exists');
  }

  // Check username uniqueness
  if (loadUserFile(username)) {
    throw new Error('Username already exists');
  }

  const passwordHash = await hashPassword(password);
  const user: User = {
    email,
    passwordHash,
    username,
    displayName: username,
    createdAt: Date.now(),
  };

  saveUserFile(username, user);
  emailIndex[email] = username;
  saveEmailIndex(emailIndex);

  return user;
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const emailIndex = loadEmailIndex();
  const username = emailIndex[email];

  if (!username) return null;

  const user = loadUserFile(username);
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export function getUserByUsername(username: string): User | null {
  return loadUserFile(username);
}

export function getUserByEmail(email: string): User | null {
  const emailIndex = loadEmailIndex();
  const username = emailIndex[email];

  if (!username) return null;

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
