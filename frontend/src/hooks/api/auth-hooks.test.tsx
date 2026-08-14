import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ConnectionProvider } from '../../providers/ConnectionProvider.tsx';
import { createQueryClient } from '../../test/hooks.tsx';
import { useLogin } from './useLogin.ts';
import { useSignup } from './useSignup.ts';
import { useLogout } from './useLogout.ts';

function renderAuth<T>(hook: () => T) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={createQueryClient()}>
      <ConnectionProvider>{children}</ConnectionProvider>
    </QueryClientProvider>
  );
  return renderHook(hook, { wrapper });
}

describe('useLogin', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('stores the session and username on success', async () => {
    const { result } = renderAuth(() => useLogin());

    await act(async () => {
      await result.current.login({ username: 'peter', password: 'secret' });
    });

    expect(result.current.error).toBeNull();
    expect(localStorage.getItem('sessionId')).toBe('sess-abc');
    expect(localStorage.getItem('username')).toBe('peter');
  });

  it('surfaces an error for invalid credentials', async () => {
    const { result } = renderAuth(() => useLogin());

    await act(async () => {
      try {
        await result.current.login({ username: 'peter', password: 'wrong' });
      } catch {
        /* expected */
      }
    });

    expect(result.current.error).toBeDefined();
    expect(localStorage.getItem('sessionId')).toBeNull();
  });
});

describe('useSignup', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('stores the session and username on success', async () => {
    const { result } = renderAuth(() => useSignup());

    await act(async () => {
      await result.current.signup({ username: 'alice', password: 'secret123' });
    });

    expect(result.current.error).toBeNull();
    expect(localStorage.getItem('sessionId')).toBe('sess-abc');
    expect(localStorage.getItem('username')).toBe('alice');
  });

  it('surfaces an error when registration fails', async () => {
    const { result } = renderAuth(() => useSignup());

    await act(async () => {
      try {
        await result.current.signup({ username: '', password: '' });
      } catch {
        /* expected */
      }
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useLogout', () => {
  it('calls the logout endpoint', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({}), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderAuth(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
      expect.objectContaining({ method: 'POST' })
    );
    vi.unstubAllGlobals();
  });
});
