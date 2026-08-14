import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/components.tsx';
import { ExploreSiteCard } from './ExploreSiteCard.tsx';
import type { Site } from '../lib/types.ts';
import type * as TanStackRouter from '@tanstack/react-router';

const navigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<TanStackRouter>();
  return { ...actual, useNavigate: () => navigate };
});

const site: Site = {
  siteId: 'site-1',
  domain: 'my-site',
  displayName: 'My Site',
  enabled: true,
  hits: 0,
  uptime: null,
  account: 'peter',
};

describe('ExploreSiteCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the site domain and author', () => {
    renderWithProviders(<ExploreSiteCard site={site} />);
    expect(screen.getByText('my-site')).toBeInTheDocument();
    expect(screen.getByText('by @peter')).toBeInTheDocument();
  });

  it('navigates to the site page from the title', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExploreSiteCard site={site} />);
    await user.click(screen.getByText('my-site'));
    expect(navigate).toHaveBeenCalledWith({ to: '/u/peter/my-site' });
  });

  it('opens the site URL in a new tab when the preview is clicked', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    const user = userEvent.setup();
    renderWithProviders(<ExploreSiteCard site={site} />);
    await user.click(screen.getByRole('link', { name: 'Open my-site' }));
    expect(open).toHaveBeenCalledWith(expect.stringContaining('my-site'), '_blank');
  });

  it('does not open a new tab for a disabled site', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    const user = userEvent.setup();
    renderWithProviders(<ExploreSiteCard site={{ ...site, enabled: false }} />);
    const preview = screen.getByRole('link', { name: 'my-site is disabled' });
    expect(preview.className).toContain('cursor-not-allowed');
    await user.click(preview);
    expect(open).not.toHaveBeenCalled();
  });

  it('navigates to the author page from the author name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExploreSiteCard site={site} />);
    await user.click(screen.getByText('by @peter'));
    expect(navigate).toHaveBeenCalledWith({ to: '/u/peter' });
  });

  it('uses the generic path for a guest site', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExploreSiteCard site={{ ...site, account: undefined }} />);
    await user.click(screen.getByText('my-site'));
    expect(navigate).toHaveBeenCalledWith({ to: '/sites/my-site' });
  });
});
