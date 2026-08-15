import { describe, it, expect } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/components.tsx';
import { DomainsSection } from './DomainsSection.tsx';
import type { ProfileDomain, Site } from '../../lib/types.ts';

const sites: Site[] = [
  { siteId: 'my-site', displayName: 'My Site', enabled: true, hits: 0, uptime: null, account: 'peter' },
];

const domains: ProfileDomain[] = [
  { user: 'peter', siteId: 'my-site', customDomain: 'example.com', verified: true },
  { user: 'peter', siteId: 'my-site', customDomain: 'pending.com', verified: false },
];

function renderSection(overrides: Partial<React.ComponentProps<typeof DomainsSection>> = {}) {
  const props = {
    username: 'peter',
    domains,
    isOwnProfile: true,
    domainsLoading: false,
    sites,
    ...overrides,
  };
  return renderWithProviders(<DomainsSection {...props} />);
}

describe('DomainsSection', () => {
  it('renders the configured domains', () => {
    renderSection();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('pending.com')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Unverified')).toBeInTheDocument();
  });

  it('opens the add domain modal from the header button', async () => {
    const user = userEvent.setup();
    renderSection();
    await user.click(screen.getByRole('button', { name: 'Add domain' }));
    expect(screen.getByRole('heading', { name: 'Add custom domain' })).toBeInTheDocument();
  });

  it('adds a custom domain to the selected site', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Add domain' }));
    await user.type(screen.getByLabelText('Custom domain'), 'newdomain.com');
    const modal = screen.getByRole('dialog');
    const submit = within(modal).getByRole('button', { name: 'Add domain' });
    await user.click(submit);

    expect(await screen.findByText('Custom domain added')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Add custom domain' })).not.toBeInTheDocument()
    );
  });

  it('rejects an invalid domain format', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: /Add domain/ }));
    await user.type(screen.getByLabelText('Custom domain'), 'not a domain');
    expect(await screen.findByText('Enter a valid domain name')).toBeInTheDocument();
  });

  it('does not show the add button for another profile', () => {
    renderSection({ isOwnProfile: false });
    expect(screen.queryByRole('button', { name: /Add domain/ })).not.toBeInTheDocument();
  });
});
