import { describe, it, expect } from 'vitest';
import type { Request as ExpressReq } from 'express';
import { extractRegisterParams } from './extract-register-params.ts';
import { extractLoginParams } from './extract-login-params.ts';

function mockReq(body: unknown): ExpressReq {
  return {
    body: JSON.stringify(body),
    get: () => undefined,
  } as unknown as ExpressReq;
}

describe('username validation', () => {
  it.each(['alice', 'john-doe', 'john_doe', 'a1', 'a'.repeat(30)])(
    'accepts %s',
    async (username) => {
      const params = await extractRegisterParams(mockReq({ username, password: 'secret123' }));
      expect(params?.username).toBe(username);
    }
  );

  it.each(['John Doe', 'johndoe!', '@johndoe', 'a'.repeat(31), '-alice', 'alice-'])(
    'rejects %s',
    async (username) => {
      const params = await extractRegisterParams(mockReq({ username, password: 'secret123' }));
      expect(params).toBeUndefined();
    }
  );

  it('normalizes mixed-case usernames to lowercase', async () => {
    const params = await extractRegisterParams(mockReq({ username: 'JohnDoe', password: 'secret123' }));
    expect(params?.username).toBe('johndoe');
  });

  it('lowercases the username on login', async () => {
    const params = await extractLoginParams(mockReq({ username: 'ALICE', password: 'secret123' }));
    expect(params?.username).toBe('alice');
  });
});
