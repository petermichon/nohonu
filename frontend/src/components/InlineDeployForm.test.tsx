import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/components.tsx';
import { InlineDeployForm } from './InlineDeployForm.tsx';

function makeZipFile(): File {
  return new File(['zip-content'], 'my-site.zip', { type: 'application/zip' });
}

function getFileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

function uploadFile(container: HTMLElement, file: File) {
  fireEvent.change(getFileInput(container), { target: { files: [file] } });
}

describe('InlineDeployForm', () => {
  it('renders the deploy form with mode toggle', () => {
    renderWithProviders(<InlineDeployForm onDeploy={vi.fn()} />);
    expect(screen.getByRole('button', { name: /File Upload/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GitHub/ })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('deployment-name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('subdomain')).toBeInTheDocument();
  });

  it('disables Deploy until a file, domain, and subdomain are provided', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<InlineDeployForm onDeploy={vi.fn()} />);

    const deployButton = screen.getByRole('button', { name: 'Deploy' });
    expect(deployButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('deployment-name'), 'my-site');
    expect(deployButton).toBeDisabled();

    uploadFile(container, makeZipFile());
    await waitFor(() => expect(deployButton).toBeEnabled());
  });

  it('rejects non-zip files', async () => {
    const { container } = renderWithProviders(<InlineDeployForm onDeploy={vi.fn()} />);
    uploadFile(container, new File(['x'], 'readme.txt', { type: 'text/plain' }));
    expect(await screen.findByText('Only .zip files are accepted')).toBeInTheDocument();
  });

  it('derives the domain from the zip file name', async () => {
    const { container } = renderWithProviders(<InlineDeployForm onDeploy={vi.fn()} />);
    uploadFile(container, makeZipFile());
    await waitFor(() => expect(screen.getByPlaceholderText('deployment-name')).toHaveValue('my-site'));
  });

  it('deploys the uploaded zip and calls onDeploy', async () => {
    const user = userEvent.setup();
    const onDeploy = vi.fn();
    const { container } = renderWithProviders(<InlineDeployForm onDeploy={onDeploy} />);

    uploadFile(container, makeZipFile());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Deploy' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Deploy' }));

    await waitFor(() => expect(onDeploy).toHaveBeenCalledWith('my-site'));
  });

  it('switches to GitHub mode and fetches the repo', async () => {
    const user = userEvent.setup();
    const onDeploy = vi.fn();
    renderWithProviders(<InlineDeployForm onDeploy={onDeploy} />);

    await user.click(screen.getByRole('button', { name: /GitHub/ }));
    await user.type(screen.getByPlaceholderText('owner/repo'), 'peter/my-site');
    await user.type(screen.getByPlaceholderText('deployment-name'), 'gh-site');
    await user.type(screen.getByPlaceholderText('subdomain'), 'peter-gh-site');
    await user.click(screen.getByRole('button', { name: /Fetch & Deploy/ }));

    await waitFor(() => expect(onDeploy).toHaveBeenCalledWith('gh-site'));
  });
});
