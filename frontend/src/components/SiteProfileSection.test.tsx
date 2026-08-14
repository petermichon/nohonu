import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/components.tsx';
import { SiteProfileSection } from './SiteProfileSection.tsx';
import type { Site } from '../lib/types.ts';

const site: Site = {
  siteId: 'site-1',
  domain: 'my-site',
  displayName: 'My Site',
  enabled: false,
  hits: 0,
  uptime: null,
  account: 'peter',
};

describe('SiteProfileSection', () => {
  it('shows a skeleton while loading', () => {
    renderWithProviders(<SiteProfileSection site={null} siteLoading />);
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Display Name')).not.toBeInTheDocument();
  });

  it('renders the display name and owner/site id', () => {
    renderWithProviders(<SiteProfileSection site={site} siteLoading={false} />);
    expect(screen.getByLabelText('Display Name')).toHaveValue('My Site');
    expect(screen.getByText('@peter')).toBeInTheDocument();
    expect(screen.getByText('site-1')).toBeInTheDocument();
  });

  it('disables Save until the display name changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteProfileSection site={site} siteLoading={false} />);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeEnabled();

    await user.clear(screen.getByLabelText('Display Name'));
    await user.type(screen.getByLabelText('Display Name'), 'New Name');
    expect(saveButton).toBeEnabled();
  });

  it('saves and shows the Saved status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteProfileSection site={site} siteLoading={false} />);

    await user.clear(screen.getByLabelText('Display Name'));
    await user.type(screen.getByLabelText('Display Name'), 'New Name');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('button', { name: 'Saved' })).toBeInTheDocument();
  });

  it('keeps the input empty after clearing (does not revert to the saved name)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteProfileSection site={site} siteLoading={false} />);

    await user.clear(screen.getByLabelText('Display Name'));
    expect(screen.getByLabelText('Display Name')).toHaveValue('');
  });

  it('shows the Error status when the save fails', async () => {
    const user = userEvent.setup();
    const { server } = await import('../test/server.ts');
    const { http, HttpResponse } = await import('msw');
    server.use(
      http.patch('*/sites/my-site/meta', () => {
        return HttpResponse.json({ error: 'boom' }, { status: 500 });
      })
    );

    renderWithProviders(<SiteProfileSection site={site} siteLoading={false} />);
    await user.clear(screen.getByLabelText('Display Name'));
    await user.type(screen.getByLabelText('Display Name'), 'New Name');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('button', { name: 'Error' })).toBeInTheDocument();
  });
});
