import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/pages.tsx';

describe('User page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the profile overview with tabs', async () => {
    localStorage.setItem('sessionId', 'sess-1');
    localStorage.setItem('username', 'peter');
    const { unmount } = await renderWithRouter('/u/peter');

    expect(await screen.findByRole('heading', { name: 'peter' })).toBeInTheDocument();
    expect(await screen.findByText('No sites yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sites/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Domains/ })).toBeInTheDocument();
    unmount();
  });

  it('shows an account not found state for an unknown user', async () => {
    const { server } = await import('../test/server.ts');
    const { http, HttpResponse } = await import('msw');
    server.use(
      http.get('*/users/:username', () => {
        return new HttpResponse(null, { status: 404 });
      }),
      http.get('*/users/:username/sites', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const { unmount } = await renderWithRouter('/u/nobody');
    expect(await screen.findByText('Account not found')).toBeInTheDocument();
    unmount();
  });

  it('switches to the sites tab', async () => {
    const { router, unmount } = await renderWithRouter('/u/peter');
    await screen.findByText('No sites yet');

    await userEvent.click(screen.getByRole('link', { name: /Sites/ }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/u/peter/sites'));
    unmount();
  });
});
