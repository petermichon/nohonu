import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/components.tsx';
import { DangerZoneSection } from './DangerZoneSection.tsx';
import type { Site } from '../lib/types.ts';

const site: Site = {
  siteId: 'my-site',

  enabled: false,
  hits: 0,
  uptime: null,
};

describe('DangerZoneSection', () => {
  it('disables deletion until the toggle is enabled', () => {
    renderWithProviders(<DangerZoneSection site={site} actionLoading={false} onRequestDelete={vi.fn()} />);

    const deleteButton = screen.getByRole('button', { name: /Delete Site Permanently/ });
    expect(deleteButton).toBeDisabled();

    screen.getByLabelText('Enable').click();
    expect(deleteButton).toBeEnabled();
  });

  it('calls onRequestDelete when confirmed', async () => {
    const user = userEvent.setup();
    const onRequestDelete = vi.fn();
    renderWithProviders(<DangerZoneSection site={site} actionLoading={false} onRequestDelete={onRequestDelete} />);

    await user.click(screen.getByLabelText('Enable'));
    await user.click(screen.getByRole('button', { name: /Delete Site Permanently/ }));

    expect(onRequestDelete).toHaveBeenCalledTimes(1);
  });

  it('warns that the site must be disabled first when enabled', () => {
    renderWithProviders(
      <DangerZoneSection site={{ ...site, enabled: true }} actionLoading={false} onRequestDelete={vi.fn()} />
    );

    expect(screen.getByText('Site must be disabled first')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete Site Permanently/ })).toBeDisabled();
  });

  it('disables all actions while a request is in progress', () => {
    renderWithProviders(<DangerZoneSection site={site} actionLoading onRequestDelete={vi.fn()} />);

    expect(screen.getByLabelText('Enable')).toBeDisabled();
  });
});
