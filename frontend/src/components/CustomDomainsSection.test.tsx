import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '../test/components.tsx';
import { CustomDomainsSection } from './CustomDomainsSection.tsx';

describe('CustomDomainsSection', () => {
  it('renders the custom domain list', async () => {
    renderWithProviders(<CustomDomainsSection username="peter" siteId="my-site" />);
    expect(await screen.findByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('pending.com')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Unverified')).toBeInTheDocument();
  });

  it('disables Add until a domain is typed', () => {
    renderWithProviders(<CustomDomainsSection username="peter" siteId="my-site" />);
    expect(screen.getByRole('button', { name: /Add/ })).toBeDisabled();
  });

  it('adds a custom domain and shows a confirmation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomDomainsSection username="peter" siteId="my-site" />);

    await user.type(screen.getByPlaceholderText('example.com'), 'newdomain.com');
    const addButton = screen.getByRole('button', { name: /Add/ });
    await waitFor(() => expect(addButton).toBeEnabled());
    await user.click(addButton);

    expect(await screen.findByText('Custom domain added')).toBeInTheDocument();
  });

  it('shows DNS instructions when there are no custom domains', async () => {
    const { server } = await import('../test/server.ts');
    server.use(
      http.get('*/sites/:domain/custom-domains', () => {
        return HttpResponse.json({ customDomains: [] });
      })
    );
    renderWithProviders(<CustomDomainsSection username="peter" siteId="my-site" />);
    expect(await screen.findByText('DNS Setup Instructions')).toBeInTheDocument();
  });

  it('removes a custom domain', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomDomainsSection username="peter" siteId="my-site" />);

    await user.click((await screen.findAllByRole('button', { name: 'Remove domain' }))[0]);
    expect(await screen.findByText('Custom domain removed')).toBeInTheDocument();
  });

  it('verifies an unverified custom domain', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomDomainsSection username="peter" siteId="my-site" />);

    await user.click(await screen.findByRole('button', { name: 'Verify domain' }));
    expect(await screen.findByText('Custom domain verified')).toBeInTheDocument();
  });
});
