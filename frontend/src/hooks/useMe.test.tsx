import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithProviders, mockFetch, TEST_CONNECTION } from '../test/hooks.tsx';
import { useMe } from './api/useMe.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMe', () => {
  it('does not fetch when there is no session', () => {
    const fetchMock = mockFetch({ user: { username: 'peter' } });
    const { result } = renderHookWithProviders(() => useMe(), {
      connection: { ...TEST_CONNECTION, sessionId: '' },
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it('fetches the current user when a session exists', async () => {
    mockFetch({ user: { username: 'peter', displayName: 'Peter' } });
    const { result } = renderHookWithProviders(() => useMe());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual({ username: 'peter', displayName: 'Peter' });
  });

  it('surfaces an error when the request fails', async () => {
    mockFetch({ message: 'nope' }, 500);
    const { result } = renderHookWithProviders(() => useMe());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });
});
