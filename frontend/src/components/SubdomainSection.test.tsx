import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/components.tsx';
import { SubdomainSection } from './SubdomainSection.tsx';

describe('SubdomainSection', () => {
  it('renders the current subdomain in the input', () => {
    renderWithProviders(<SubdomainSection subdomain="peter-site" siteLoading={false} />);
    expect(screen.getByPlaceholderText('subdomain')).toHaveValue('peter-site');
  });

  it('shows a skeleton while loading', () => {
    renderWithProviders(<SubdomainSection subdomain={null} siteLoading />);
    expect(screen.queryByLabelText(/subdomain/i)).not.toBeInTheDocument();
  });

  it('renders the read-only value when isReadOnly', () => {
    renderWithProviders(<SubdomainSection subdomain="peter-site" siteLoading={false} isReadOnly />);
    expect(screen.getByText('peter-site')).toBeInTheDocument();
  });

  it('disables Save until the subdomain changes', () => {
    renderWithProviders(<SubdomainSection subdomain="peter-site" siteLoading={false} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('saves a changed subdomain and shows a confirmation toast', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SubdomainSection subdomain="peter-site" siteLoading={false} />);

    await user.clear(screen.getByPlaceholderText('subdomain'));
    await user.type(screen.getByPlaceholderText('subdomain'), 'peter-new');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(await screen.findByText('Subdomain updated')).toBeInTheDocument();
  });

  it('sanitizes the subdomain to lowercase letters, numbers, and dashes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SubdomainSection subdomain="peter-site" siteLoading={false} />);

    await user.clear(screen.getByPlaceholderText('subdomain'));
    await user.type(screen.getByPlaceholderText('subdomain'), 'Peter_New!!');
    expect(screen.getByPlaceholderText('subdomain')).toHaveValue('peternew');
  });
});
