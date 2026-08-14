import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHookWithProviders, mockFetch, TEST_CONNECTION } from '../../test/hooks.tsx';
import { useApiFetch } from './useApiFetch.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useApiFetch', () => {
  it('builds the request URL from the API base', async () => {
    const fetchMock = mockFetch({ ok: true });
    const { result } = renderHookWithProviders(() => useApiFetch());

    await result.current.apiFetch('/health');

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/health');
  });

  it('sends the server password, session, and username headers', async () => {
    const fetchMock = mockFetch({ ok: true });
    const { result } = renderHookWithProviders(() => useApiFetch());

    await result.current.apiFetch('/sites');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['X-Server-Password']).toBe(TEST_CONNECTION.serverPassword);
    expect(headers['X-Session-Id']).toBe(TEST_CONNECTION.sessionId);
    expect(headers['X-Username']).toBe(TEST_CONNECTION.username);
  });

  it('omits empty headers', async () => {
    const fetchMock = mockFetch({ ok: true });
    const { result } = renderHookWithProviders(() => useApiFetch(), {
      connection: { ...TEST_CONNECTION, serverPassword: '', sessionId: '', username: '' },
    });

    await result.current.apiFetch('/health');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['X-Server-Password']).toBeUndefined();
    expect(headers['X-Session-Id']).toBeUndefined();
    expect(headers['X-Username']).toBeUndefined();
  });

  it('merges custom headers with the default ones', async () => {
    const fetchMock = mockFetch({ ok: true });
    const { result } = renderHookWithProviders(() => useApiFetch());

    await result.current.apiFetch('/sites', {
      headers: { 'Content-Type': 'application/json' },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Session-Id']).toBe(TEST_CONNECTION.sessionId);
  });
});
