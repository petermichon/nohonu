import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/components.tsx';
import { TEST_CONNECTION } from '../test/hooks.tsx';
import { HomeSiteCard } from './HomeSiteCard.tsx';
import type { Site } from '../lib/types.ts';
import type * as TanStackRouter from '@tanstack/react-router';

const navigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<TanStackRouter>();
  return { ...actual, useRouter: () => ({ navigate }) };
});

const site: Site = {
  siteId: 'my-site',

  displayName: 'My Site',
  enabled: true,
  hits: 1200,
  uptime: 99,
  account: 'peter',
  starCount: 3,
  isStarred: false,
};

describe('HomeSiteCard', () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the site name, hits, and star count', async () => {
    renderWithProviders(<HomeSiteCard site={site} />);
    await waitFor(() => expect(screen.getByText('Peter')).toBeInTheDocument());
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('navigates to the site preview when the preview area is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeSiteCard site={site} />);
    await user.click(screen.getByRole('link', { name: 'Open My Site' }));
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({ params: { username: 'peter', siteId: 'my-site' } })
    );
  });

  it('marks the preview as non-navigable when the site is disabled', async () => {
    renderWithProviders(<HomeSiteCard site={{ ...site, enabled: false }} />);
    const preview = screen.getByRole('link', { name: 'Open My Site' });
    expect(preview.className).toContain('cursor-not-allowed');
  });

  it('calls the star endpoint when the star button is clicked', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderWithProviders(<HomeSiteCard site={site} />);
    await user.click(screen.getByRole('button', { name: 'Star site' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/users/peter/sites/my-site/star'),
        expect.objectContaining({ method: 'PATCH' })
      )
    );
  });

  it('does not call the star endpoint when logged out', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderWithProviders(<HomeSiteCard site={site} />, {
      connection: { ...TEST_CONNECTION, username: '' },
    });
    await user.click(screen.getByRole('button', { name: 'Star site' }));

    await waitFor(() => {
      const starCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/star'));
      expect(starCalls).toHaveLength(0);
    });
  });
});
