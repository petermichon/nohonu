import { beforeEach, describe, expect, it } from 'vitest';
import {
  changePassword,
  cleanupExpiredSessions,
  deleteAccount,
  deleteProfilePicture,
  deleteSession,
  getProfilePictureFile,
  getPublicUser,
  listSessions,
  login,
  logout,
  logoutAll,
  me,
  register,
  registerUser,
  resetTestState,
  sites,
  updateDisplayName,
  uploadProfilePicture,
  makeStoredZip,
} from '../../test/setup.ts';

beforeEach(async () => {
  await resetTestState();
});

describe('register', () => {
  it('creates a user and session, without exposing the password hash', async () => {
    const result = await register('secret123', 'alice');
    expect(result.success).toBe(true);
    expect(result.user?.username).toBe('alice');
    expect(result.session).toBeTruthy();
    expect(result.user?.passwordHash).toBeUndefined();
  });

  it('rejects a duplicate username', async () => {
    await register('secret123', 'alice');
    const result = await register('secret456', 'alice');
    expect(result.success).toBe(false);
  });
});

describe('login', () => {
  it('returns a session for correct credentials', async () => {
    await register('secret123', 'alice');
    const result = await login('alice', 'secret123');
    expect(result.success).toBe(true);
    expect(result.user?.username).toBe('alice');
    expect(result.session).toBeTruthy();
  });

  it('fails with a wrong password', async () => {
    await register('secret123', 'alice');
    const result = await login('alice', 'wrong');
    expect(result.success).toBe(false);
    expect(result.user).toBeUndefined();
  });

  it('fails for an unknown user', async () => {
    const result = await login('nobody', 'secret123');
    expect(result.success).toBe(false);
  });
});

describe('me', () => {
  it('returns the session user', async () => {
    const sessionId = await registerUser('bob');
    const result = await me(sessionId);
    expect(result.error).toBeUndefined();
    expect(result.user?.username).toBe('bob');
    expect(result.session?.id).toBe(sessionId);
  });

  it('fails for an invalid session', async () => {
    const result = await me('not-a-session');
    expect(result.error).toBe('Invalid session');
  });
});

describe('logout', () => {
  it('invalidates the session', async () => {
    const sessionId = await registerUser('carol');
    await logout(sessionId);
    const result = await me(sessionId);
    expect(result.error).toBe('Invalid session');
  });
});

describe('logoutAll', () => {
  it('invalidates every session of the user', async () => {
    const first = await registerUser('karl');
    const second = await login('karl', 'password123');
    await logoutAll('karl');
    expect((await me(first)).error).toBe('Invalid session');
    expect((await me(second.session ?? '')).error).toBe('Invalid session');
  });
});

describe('cleanupExpiredSessions', () => {
  it('removes sessions older than the cutoff', async () => {
    const sessionId = await registerUser('cleanup');
    await cleanupExpiredSessions(0);
    expect((await me(sessionId)).error).toBe('Invalid session');
  });

  it('keeps fresh sessions when the cutoff is far in the past', async () => {
    const sessionId = await registerUser('fresh');
    await cleanupExpiredSessions(30 * 24 * 60 * 60 * 1000 * 2);
    expect((await me(sessionId)).error).toBeUndefined();
  });
});

describe('updateDisplayName', () => {
  it('updates the display name', async () => {
    const sessionId = await registerUser('dave');
    const result = await updateDisplayName(sessionId, 'Dave');
    expect(result.success).toBe(true);
    expect((await getPublicUser('dave'))?.displayName).toBe('Dave');
  });

  it('fails for an invalid session', async () => {
    const result = await updateDisplayName('bad-session', 'X');
    expect(result.success).toBe(false);
  });
});

describe('changePassword', () => {
  it('changes the password and allows login with the new one', async () => {
    const registerResult = await register('password123', 'peter');
    const sessionId = registerResult.session ?? '';

    const result = await changePassword(sessionId, 'password123', 'new-password');
    expect(result.success).toBe(true);

    expect((await login('peter', 'password123')).success).toBe(false);
    expect((await login('peter', 'new-password')).success).toBe(true);
  });

  it('rejects a wrong current password', async () => {
    const sessionId = await registerUser('quinn');
    const result = await changePassword(sessionId, 'wrong-current', 'new-password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Current password is incorrect');
  });

  it('rejects an invalid session', async () => {
    const result = await changePassword('bad-session', 'password123', 'new-password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid session');
  });

  it('rejects a new password identical to the current one', async () => {
    const sessionId = await registerUser('rachel');
    const result = await changePassword(sessionId, 'password123', 'password123');
    expect(result.success).toBe(false);
    expect(result.error).toBe('New password must be different');
  });
});

describe('profile picture', () => {
  it('uploads, reads and deletes a picture', async () => {
    const sessionId = await registerUser('erin');
    const data = new Uint8Array([1, 2, 3, 4]);

    const upload = await uploadProfilePicture(sessionId, 'image/jpeg', data.buffer);
    expect(upload.success).toBe(true);
    expect(await getProfilePictureFile('erin')).toEqual(data);

    const del = await deleteProfilePicture(sessionId);
    expect(del.success).toBe(true);
    expect(await getProfilePictureFile('erin')).toBeNull();
  });

  it('rejects a non-image content type', async () => {
    const sessionId = await registerUser('frank');
    const result = await uploadProfilePicture(sessionId, 'text/plain', new Uint8Array([1]).buffer);
    expect(result.success).toBe(false);
  });
});

describe('public user', () => {
  it('reports existence and public info without sensitive fields', async () => {
    await registerUser('grace');
    expect(await getPublicUser('nobody')).toBeNull();

    const publicUser = await getPublicUser('grace');
    expect(publicUser?.username).toBe('grace');
    expect(publicUser?.passwordHash).toBeUndefined();
  });
});

describe('sessions', () => {
  it('lists all sessions of the user', async () => {
    const first = await registerUser('heidi');
    await login('heidi', 'password123');

    const result = await listSessions(first);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBe(2);
    }
  });

  it('rejects an invalid session', async () => {
    const result = await listSessions('not-a-session');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('unauthorized');
    }
  });

  it('deletes another session of the same user', async () => {
    const first = await registerUser('ivan');
    const second = await login('ivan', 'password123');

    const result = await deleteSession(first, second.session ?? '');
    expect(result.ok).toBe(true);

    const list = await listSessions(first);
    expect(list.ok && list.value.length).toBe(1);
  });

  it('refuses to delete the current session', async () => {
    const sessionId = await registerUser('judy');
    const result = await deleteSession(sessionId, sessionId);
    expect(result.ok).toBe(false);
  });

  it('refuses to delete another user session', async () => {
    const owner = await registerUser('mallory');
    const other = await registerUser('trent');

    const result = await deleteSession(other, owner);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('forbidden');
    }
  });
});

describe('deleteAccount', () => {
  it('deletes the user, invalidates their sessions and removes them from the public profile', async () => {
    const sessionId = await registerUser('goner');
    const result = await deleteAccount(sessionId, 'password123');
    expect(result.ok).toBe(true);
    expect((await me(sessionId)).error).toBe('Invalid session');
    expect(await getPublicUser('goner')).toBeNull();
  });

  it('rejects a wrong password', async () => {
    const sessionId = await registerUser('wrongPw');
    const result = await deleteAccount(sessionId, 'not-the-password');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('unauthorized');
    }
  });

  it('rejects an invalid session', async () => {
    const result = await deleteAccount('not-a-session', 'password123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('unauthorized');
    }
  });

  it('removes the user\u2019s stars from other people\u2019s sites', async () => {
    const ownerSession = await registerUser('starOwner');
    const deleterSession = await registerUser('starDeleter');
    const zip = makeStoredZip({ 'index.html': new TextEncoder().encode('x') });
    const created = await sites.createSite(ownerSession, 'starred-site', zip);
    expect(created.ok).toBe(true);

    const starred = await sites.toggleStar(deleterSession, 'starOwner', 'starred-site', true);
    expect(starred.ok && starred.value.starCount).toBe(1);

    const result = await deleteAccount(deleterSession, 'password123');
    expect(result.ok).toBe(true);

    const thirdSession = await registerUser('thirdUser');
    const restarred = await sites.toggleStar(thirdSession, 'starOwner', 'starred-site', true);
    expect(restarred.ok && restarred.value.starCount).toBe(1);
  });
});
