import { getUserByUsername } from '../../core/auth/users/get-user-by-username.ts';

export async function userExists(username: string): Promise<boolean> {
  const user = await getUserByUsername(username);
  return user !== null;
}
