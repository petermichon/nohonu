import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/components.tsx';
import { SettingsSection } from './SettingsSection.tsx';

describe('SettingsSection', () => {
  it('renders profile, password, and sessions sections', async () => {
    renderWithProviders(<SettingsSection username="peter" />);
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Password' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Active Sessions' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Display Name')).toHaveValue('Peter'));
  });

  it('shows the display name and disables Save until it changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsSection username="peter" />);
    await waitFor(() => expect(screen.getByLabelText('Display Name')).toHaveValue('Peter'));

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();

    await user.clear(screen.getByLabelText('Display Name'));
    await user.type(screen.getByLabelText('Display Name'), 'Petra');
    expect(saveButton).toBeEnabled();
  });

  it('clears the input after a successful display name save', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsSection username="peter" />);
    await waitFor(() => expect(screen.getByLabelText('Display Name')).toHaveValue('Peter'));

    await user.clear(screen.getByLabelText('Display Name'));
    await user.type(screen.getByLabelText('Display Name'), 'Petra');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.getByLabelText('Display Name')).toHaveValue('Peter'));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('disables the Change button until all password fields are filled and match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsSection username="peter" />);

    const changeButton = screen.getByRole('button', { name: 'Change' });
    expect(changeButton).toBeDisabled();

    await user.type(screen.getByLabelText('Current Password'), 'old-pass');
    await user.type(screen.getByLabelText('New Password'), 'new-pass');
    await user.type(screen.getByLabelText('Confirm New Password'), 'new-pass');
    expect(changeButton).toBeEnabled();
  });

  it('shows a toast when new passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsSection username="peter" />);

    await user.type(screen.getByLabelText('Current Password'), 'old-pass');
    await user.type(screen.getByLabelText('New Password'), 'new-pass-1');
    await user.type(screen.getByLabelText('Confirm New Password'), 'new-pass-2');

    const changeButton = screen.getByRole('button', { name: 'Change' });
    expect(changeButton).toBeDisabled();
  });

  it('lists active sessions with a revoke action', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsSection username="peter" />);

    const revokeButton = await screen.findByRole('button', { name: 'Revoke session' });
    expect(revokeButton).toBeInTheDocument();

    await user.click(revokeButton);
    await screen.findByText('Session revoked');
  });
});
