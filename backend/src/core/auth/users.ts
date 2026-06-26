// ponytail: JSON file storage - simple, no database dependency, upgrade to KV/Postgres if scale needed

import { hashPassword, verifyPassword } from './password.ts';

const USERS_FILE = './data/users.json';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
  createdAt: number;
}

interface UsersData {
  users: User[];
  nextId: number;
}

function loadUsers(): UsersData {
  try {
    const data = Deno.readTextFileSync(USERS_FILE);
    return JSON.parse(data);
  } catch {
    return { users: [], nextId: 1 };
  }
}

function saveUsers(data: UsersData): void {
  Deno.writeTextFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

export async function createUser(email: string, password: string, username: string): Promise<User> {
  const data = loadUsers();
  
  // Check email uniqueness
  if (data.users.some(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  
  // Check username uniqueness
  if (data.users.some(u => u.username === username)) {
    throw new Error('Username already exists');
  }
  
  const passwordHash = await hashPassword(password);
  const user: User = {
    id: String(data.nextId++),
    email,
    passwordHash,
    username,
    displayName: username,
    createdAt: Date.now()
  };
  
  data.users.push(user);
  saveUsers(data);
  
  return user;
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const data = loadUsers();
  const user = data.users.find(u => u.email === email);
  
  if (!user) return null;
  
  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export function getUserById(id: string): User | null {
  const data = loadUsers();
  return data.users.find(u => u.id === id) ?? null;
}

export function getUserByUsername(username: string): User | null {
  const data = loadUsers();
  return data.users.find(u => u.username === username) ?? null;
}

export function getUserByEmail(email: string): User | null {
  const data = loadUsers();
  return data.users.find(u => u.email === email) ?? null;
}
