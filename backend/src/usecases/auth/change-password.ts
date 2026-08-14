import { session as sessionTable } from '../../db/session.ts';
import { user as userTable } from '../../db/user.ts';
import { hashPassword, verifyPassword } from '../../shared/password.ts';

import type { ProfileResult } from '../../shared/profile-result.ts';

export async function changePassword(
  sessionId: string,
  currentPassword: string,
  newPassword: string
): Promise<ProfileResult> {
  const session = await sessionTable.findUnique({ where: { id: sessionId } });
  if (!session) {
    return { success: false, error: 'Invalid session' };
  }

  const user = await userTable.findUnique({ where: { username: session.username } });
  if (!user) {
    return { success: false, error: 'Invalid session' };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  if (newPassword === currentPassword) {
    return { success: false, error: 'New password must be different' };
  }

  try {
    const passwordHash = await hashPassword(newPassword);
    await userTable.update({ where: { username: user.username }, data: { passwordHash } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change password',
    };
  }
}
