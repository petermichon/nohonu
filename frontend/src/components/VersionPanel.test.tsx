import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/components.tsx';
import { VersionPanel } from './VersionPanel.tsx';
import type { Version } from '../lib/types.ts';

const versions: Version[] = [
  { index: 1, size: 2048, source: { type: 'upload' }, createdAt: 1720000000000 },
  { index: 2, size: 4096, source: { type: 'github', repo: 'peter/my-site', branch: 'main' }, createdAt: 1720000100000 },
];

function renderPanel(overrides: Partial<React.ComponentProps<typeof VersionPanel>> = {}) {
  const props = {
    username: 'peter',
    siteId: 'my-site',
    versions,
    versionsLoading: false,
    currentVersion: 2,
    activating: null,
    deletingVersion: null,
    onActivate: vi.fn(),
    onDelete: vi.fn(),
    onDownload: vi.fn(),
    onUploaded: vi.fn(),
    onToast: vi.fn(),
    ...overrides,
  };
  return { ...renderWithProviders(<VersionPanel {...props} />), props };
}

describe('VersionPanel', () => {
  it('renders the version count and the version rows', () => {
    renderPanel();
    expect(screen.getByText('2 versions')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('peter/my-site')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('shows an empty state when there are no versions', () => {
    renderPanel({ versions: [] });
    expect(screen.getByText('No versions yet')).toBeInTheDocument();
  });

  it('activates a non-current version', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();

    const activateButtons = screen.getAllByRole('button', { name: 'Activate' });
    await user.click(activateButtons[0]);
    expect(props.onActivate).toHaveBeenCalledWith(1);
  });

  it('does not activate the current version', () => {
    renderPanel();
    const activateButtons = screen.getAllByRole('button', { name: 'Activate' });
    expect(activateButtons).toHaveLength(2);
    expect(activateButtons[0]).toBeEnabled();
    expect(activateButtons[1]).toBeDisabled();
  });

  it('deletes a non-current version', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete version' });
    expect(deleteButtons[0]).toBeEnabled();
    await user.click(deleteButtons[0]);
    expect(props.onDelete).toHaveBeenCalledWith(1);
  });

  it('does not offer delete or activate in read-only mode', () => {
    renderPanel({ isReadOnly: true });
    screen.getAllByRole('button', { name: 'Delete version' }).forEach((b) => expect(b).toBeDisabled());
    screen.getAllByRole('button', { name: 'Activate' }).forEach((b) => expect(b).toBeDisabled());
  });

  it('uploads a zip file and reports success', async () => {
    const { props } = renderPanel();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'v1.zip', { type: 'application/zip' })] } });

    await waitFor(() => expect(props.onUploaded).toHaveBeenCalled());
    expect(props.onToast).toHaveBeenCalledWith('Version uploaded', true);
  });

  it('rejects non-zip files', async () => {
    const { props } = renderPanel();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'v1.txt', { type: 'text/plain' })] } });

    expect(await screen.findByText('Only .zip files are accepted')).toBeInTheDocument();
    expect(props.onToast).not.toHaveBeenCalled();
  });

  it('fetches a version from GitHub', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'From GitHub' }));
    await user.type(screen.getByPlaceholderText('owner/repo'), 'peter/other');
    await user.click(screen.getByRole('button', { name: 'Fetch & Add' }));

    await waitFor(() => expect(props.onToast).toHaveBeenCalledWith('Version fetched from GitHub', true));
    expect(props.onUploaded).toHaveBeenCalled();
  });
});
