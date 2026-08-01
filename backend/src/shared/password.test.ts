import { describe, expect, it } from 'vitest';
import { pbkdf2Sync } from 'node:crypto';
import { deriveHash, hashPassword, verifyPassword } from './password.ts';

const SALT = Uint8Array.from({ length: 16 }, (_, i) => i);

describe('deriveHash', () => {
  it('is deterministic for a fixed password and salt', async () => {
    expect(await deriveHash('secret', SALT)).toBe(await deriveHash('secret', SALT));
  });

  it('matches a known PBKDF2-SHA256 answer', async () => {
    const reference = pbkdf2Sync('secret', SALT, 100000, 32, 'sha256');
    const expected = Buffer.concat([Buffer.from(SALT), reference]).toString('base64');
    expect(await deriveHash('secret', SALT)).toBe(expected);
  });

  it('differs when the salt changes', async () => {
    const otherSalt = Uint8Array.from({ length: 16 }, (_, i) => i + 1);
    expect(await deriveHash('secret', SALT)).not.toBe(await deriveHash('secret', otherSalt));
  });
});

describe('hashPassword', () => {
  it('produces a fresh hash on every call', async () => {
    expect(await hashPassword('secret')).not.toBe(await hashPassword('secret'));
  });
});

describe('verifyPassword', () => {
  it('accepts the correct password', async () => {
    const hash = await hashPassword('secret');
    expect(await verifyPassword('secret', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('secret');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
