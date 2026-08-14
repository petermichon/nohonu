import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from './Toast.tsx';
import { AccentColorProvider } from '../providers/AccentColorProvider.tsx';

function renderToast(props: Partial<Parameters<typeof Toast>[0]> = {}) {
  return render(
    <AccentColorProvider>
      <Toast message="Deployed!" visible onClose={vi.fn()} {...props} />
    </AccentColorProvider>
  );
}

describe('Toast', () => {
  it('renders nothing when not visible', () => {
    const { container } = renderToast({ visible: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message when visible', () => {
    renderToast();
    expect(screen.getByText('Deployed!')).toBeInTheDocument();
  });

  it('calls onClose when the dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderToast({ onClose });
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
