import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { renderHookWithProviders, mockFetch } from '../test/hooks.tsx';
import { useSites } from './api/useSites.ts';
import type { Site } from '../lib/types.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

const SITE: Site = {
  siteId: '1',
  domain: 'example.com',
  enabled: true,
  hits: 0,
  uptime: null,
};

describe('useSites', () => {
  it('returns sites fetched from the API', async () => {
    mockFetch({ sites: [SITE] });
    const { result } = renderHookWithProviders(() => useSites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sites).toEqual([SITE]);
    expect(result.current.error).toBe(false);
  });

  it('defaults to an empty list when the API returns no sites', async () => {
    mockFetch({});
    const { result } = renderHookWithProviders(() => useSites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sites).toEqual([]);
  });

  it('reports an unauthorized error on 401', async () => {
    mockFetch({ message: 'unauthorized' }, 401);
    const { result } = renderHookWithProviders(() => useSites());

    await waitFor(() => expect(result.current.error).not.toBe(false));
    expect(result.current.error).toBe('unauthorized');
  });

  it('reports a connection error when the network fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      })
    );
    const { result } = renderHookWithProviders(() => useSites());

    await waitFor(() => expect(result.current.error).not.toBe(false));
    expect(result.current.error).toBe('connection');
  });

  it('reports a connection error on other HTTP failures', async () => {
    mockFetch({ message: 'boom' }, 500);
    const { result } = renderHookWithProviders(() => useSites());

    await waitFor(() => expect(result.current.error).not.toBe(false));
    expect(result.current.error).toBe('connection');
    expect(result.current.sites).toEqual([]);
  });

  it('refetches when refreshSites is called', async () => {
    const fetchMock = mockFetch({ sites: [SITE] });
    const { result } = renderHookWithProviders(() => useSites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const firstCalls = fetchMock.mock.calls.length;

    await act(async () => {
      result.current.refreshSites();
    });

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(firstCalls));
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/sites', expect.anything());
  });
});
