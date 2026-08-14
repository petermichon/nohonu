import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal.tsx';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Title">
        <p>Content</p>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title and children when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Delete site?">
        <p>Are you sure?</p>
      </Modal>
    );
    expect(screen.getByRole('heading', { name: 'Delete site?' })).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside the modal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>
    );
    await user.click(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the modal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>
    );
    await user.click(screen.getByText('Content'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
