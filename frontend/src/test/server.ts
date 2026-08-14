import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json()) as { username?: string; password?: string };
    if (body.password === 'wrong') {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json({ session: 'sess-abc', user: { username: body.username ?? 'peter' } });
  }),
  http.post('*/auth/register', async ({ request }) => {
    const body = (await request.json()) as { username?: string };
    return HttpResponse.json({ session: 'sess-abc', user: { username: body.username ?? 'alice' } });
  }),
  http.post('*/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),
  http.get('*/auth/me', () => {
    return HttpResponse.json({ user: { username: 'peter', displayName: 'Peter' } });
  }),
  http.get('*/sites', () => {
    return HttpResponse.json({ sites: [] });
  }),
  http.get('*/auth/sessions', () => {
    return HttpResponse.json({
      sessions: [
        {
          id: 'sess-other',
          username: 'peter',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0',
          createdAt: 1720000000000,
          lastActive: 1720000000000,
        },
      ],
    });
  }),
  http.delete('*/auth/sessions/delete', () => {
    return HttpResponse.json({ success: true });
  }),
  http.patch('*/auth/displayname', () => {
    return HttpResponse.json({ success: true });
  }),
  http.patch('*/auth/password', async ({ request }) => {
    const body = (await request.json()) as { currentPassword?: string };
    if (body.currentPassword === 'wrong-current') {
      return HttpResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }
    return HttpResponse.json({ success: true });
  }),
  http.get('*/check-subdomain', ({ request }) => {
    const url = new URL(request.url);
    const subdomain = url.searchParams.get('subdomain');
    if (subdomain === 'taken') {
      return HttpResponse.json({ subdomain, taken: true });
    }
    return new HttpResponse(null, { status: 404 });
  }),
  http.get('*/check-domain', ({ request }) => {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');
    if (domain === 'taken') {
      return HttpResponse.json({ domain, taken: true });
    }
    return new HttpResponse(null, { status: 404 });
  }),
  http.patch('*/sites/meta', async ({ request }) => {
    await request.json();
    return HttpResponse.json({ success: true });
  }),
  http.patch('*/sites/:domain/meta', async ({ request }) => {
    await request.json();
    return HttpResponse.json({ success: true });
  }),
  http.post('*/sites/:domain', () => {
    return HttpResponse.json({ success: true });
  }),
  http.post('*/sites/:domain/github', () => {
    return HttpResponse.json({ success: true });
  }),
  http.get('*/sites/:domain/repos', () => {
    return HttpResponse.json({
      repos: [{ repo: 'peter/my-site', branch: 'main', lastUsed: 1720000000000 }],
    });
  }),
  http.patch('*/sites/:domain/star', () => {
    return HttpResponse.json({ success: true });
  }),
  http.get('*/users/:username', () => {
    return HttpResponse.json({ user: { username: 'peter', displayName: 'Peter' } });
  }),
  http.post('*/sites/:domain/versions', () => {
    return HttpResponse.json({ success: true });
  }),
  http.post('*/sites/:domain/versions/github', () => {
    return HttpResponse.json({ success: true });
  }),
  http.get('*/sites/:domain/custom-domains', () => {
    return HttpResponse.json({
      customDomains: [
        { domain: 'example.com', verified: true },
        { domain: 'pending.com', verified: false },
      ],
    });
  }),
  http.get('*/custom-domains', () => {
    return HttpResponse.json({ customDomains: [] });
  }),
  http.get('*/sites/:domain/custom-domains/token', () => {
    return HttpResponse.json({ token: 'tok-abc' });
  }),
  http.post('*/sites/:domain/custom-domains', () => {
    return HttpResponse.json({ success: true });
  }),
  http.post('*/sites/:domain/custom-domains/:customDomain/verify', () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete('*/sites/:domain/custom-domains/:customDomain', () => {
    return HttpResponse.json({ success: true });
  }),
  http.get('*/auth', ({ request }) => {
    if (request.headers.get('X-Server-Password') === 'wrong') {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json({ secured: true });
  }),
];

export const server = setupServer(...handlers);
