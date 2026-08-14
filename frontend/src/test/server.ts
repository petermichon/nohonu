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
  http.get('*/auth/me', () => {
    return HttpResponse.json({ user: { username: 'peter', displayName: 'Peter' } });
  }),
  http.get('*/sites', () => {
    return HttpResponse.json({ sites: [] });
  }),
];

export const server = setupServer(...handlers);
