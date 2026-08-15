import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderHookWithProviders } from '../../test/hooks.tsx';
import { useUploadVersion } from './useUploadVersion.ts';
import { useFetchVersionGithub } from './useFetchVersionGithub.ts';
import { useCreateSite } from './useCreateSite.ts';
import { useToggleStar } from './useToggleStar.ts';

function stubFetch() {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function bodyOf(call: [string, RequestInit]) {
  return JSON.parse(call[1].body as string);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('deploy/upload hook smoke tests', () => {
  it('uploads a version to the domain versions endpoint', async () => {
    const fetchMock = stubFetch();
    const { result } = renderHookWithProviders(() => useUploadVersion('peter', 'my-site'));

    await act(async () => {
      await result.current.uploadVersion({ file: new File(['zip'], 'v1.zip') });
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/users/peter/sites/my-site/versions');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/zip');
    expect(init.body).toBeInstanceOf(File);
  });

  it('fetches a GitHub version with repo and branch', async () => {
    const fetchMock = stubFetch();
    const { result } = renderHookWithProviders(() => useFetchVersionGithub('peter', 'my-site'));

    await act(async () => {
      await result.current.fetchGithub({ repo: 'peter/my-site', branch: 'main' });
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/users/peter/sites/my-site/versions/github');
    expect(init.method).toBe('POST');
    expect(bodyOf([url, init])).toEqual({ repo: 'peter/my-site', branch: 'main' });
  });

  it('creates a site with the domain and subdomain query', async () => {
    const fetchMock = stubFetch();
    const { result } = renderHookWithProviders(() => useCreateSite());

    await act(async () => {
      await result.current.createSite({
        username: 'peter',
        file: new File(['zip'], 'site.zip'),
        siteId: 'my-site',
        subdomain: 'peter-my-site',
      });
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/users/peter/sites/my-site?subdomain=peter-my-site');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(File);
  });

  it('toggles the star with the starred flag', async () => {
    const fetchMock = stubFetch();
    const { result } = renderHookWithProviders(() => useToggleStar());

    await act(async () => {
      await result.current.toggleStar('peter', 'my-site', true);
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/users/peter/sites/my-site/star');
    expect(init.method).toBe('PATCH');
    expect(bodyOf([url, init])).toEqual({ starred: true });
  });

  it('surfaces the error message on failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'boom' }), { status: 400 })));
    const { result } = renderHookWithProviders(() => useUploadVersion('peter', 'my-site'));

    await act(async () => {
      try {
        await result.current.uploadVersion({ file: new File(['x'], 'v.zip') });
      } catch (err) {
        expect((err as Error).message).toBe('boom');
      }
    });
  });
});
