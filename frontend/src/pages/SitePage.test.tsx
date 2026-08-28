import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/pages.tsx';

describe('Site page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the site overview for a public site', async () => {
    const { unmount } = await renderWithRouter('/u/peter/sites/my-site');

    expect(await screen.findAllByText('my-site')).not.toHaveLength(0);
    expect(screen.getByText('@peter')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Overview/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Analytics/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Domains/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Versions/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Settings/ })).not.toBeInTheDocument();
    unmount();
  });

  it('shows a not found state for a missing site', async () => {
    const { server } = await import('../test/server.ts');
    const { http, HttpResponse } = await import('msw');
    server.use(
      http.get('*/users/peter/sites/my-site', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const { unmount } = await renderWithRouter('/u/peter/sites/my-site');
    expect(await screen.findByText('Site not found')).toBeInTheDocument();
    unmount();
  });
});
