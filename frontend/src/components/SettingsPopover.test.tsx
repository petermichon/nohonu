import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/components.tsx';
import { SettingsPopover } from './SettingsPopover.tsx';

describe('SettingsPopover', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens and shows the server password field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPopover />);

    await user.click(screen.getByRole('button', { name: 'Connection settings' }));
    expect(screen.getByLabelText('Server password')).toBeInTheDocument();
  });

  it('shows the invalid message for a wrong password', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPopover />);

    await user.click(screen.getByRole('button', { name: 'Connection settings' }));
    await user.clear(screen.getByLabelText('Server password'));
    await user.type(screen.getByLabelText('Server password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Invalid server password')).toBeInTheDocument();
  });

  it('marks a valid password as saved', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPopover />);

    await user.click(screen.getByRole('button', { name: 'Connection settings' }));
    await user.clear(screen.getByLabelText('Server password'));
    await user.type(screen.getByLabelText('Server password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.getByRole('button', { name: '✓' })).toBeInTheDocument());
  });
});
