import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from './ConfirmModal.tsx';
import { AccentColorProvider } from '../providers/AccentColorProvider.tsx';

function renderModal(props: Parameters<typeof ConfirmModal>[0]) {
  return render(
    <AccentColorProvider>
      <ConfirmModal {...props} />
    </AccentColorProvider>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('ConfirmModal', () => {
  it('renders nothing when closed', () => {
    const { container } = renderModal({ isOpen: false, onClose: vi.fn(), onConfirm: vi.fn(), action: 'enable', domain: 'x.com' });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the action title, message and domain', () => {
    renderModal({ isOpen: true, onClose: vi.fn(), onConfirm: vi.fn(), action: 'disable', domain: 'x.com' });
    expect(screen.getByRole('heading', { name: 'Disable site?' })).toBeInTheDocument();
    expect(screen.getByText(/make the site inaccessible/)).toBeInTheDocument();
    expect(screen.getByText('x.com')).toBeInTheDocument();
  });

  it('enables confirm immediately for non-danger actions', () => {
    renderModal({ isOpen: true, onClose: vi.fn(), onConfirm: vi.fn(), action: 'enable', domain: 'x.com' });
    expect(screen.getByRole('button', { name: 'Enable' })).toBeEnabled();
  });

  it('disables confirm during the countdown for delete actions', () => {
    vi.useFakeTimers();
    renderModal({ isOpen: true, onClose: vi.fn(), onConfirm: vi.fn(), action: 'delete', domain: 'x.com' });
    const button = screen.getByRole('button', { name: 'Delete (3)' });
    expect(button).toBeDisabled();
  });

  it('enables confirm after the countdown completes', () => {
    vi.useFakeTimers();
    renderModal({ isOpen: true, onClose: vi.fn(), onConfirm: vi.fn(), action: 'delete', domain: 'x.com' });
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
  });

  it('calls onConfirm when the confirm button is clicked and enabled', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderModal({ isOpen: true, onClose: vi.fn(), onConfirm, action: 'enable', domain: 'x.com' });
    await user.click(screen.getByRole('button', { name: 'Enable' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose, onConfirm: vi.fn(), action: 'enable', domain: 'x.com' });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
