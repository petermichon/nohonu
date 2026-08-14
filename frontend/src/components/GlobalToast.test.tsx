import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '../providers/ToastContext.tsx';
import { AccentColorProvider } from '../providers/AccentColorProvider.tsx';
import { GlobalToast } from './GlobalToast.tsx';

function Harness() {
  const { showToast } = useToast();
  return (
    <>
      <button type="button" onClick={() => showToast('Deployed!')}>
        show
      </button>
      <GlobalToast />
    </>
  );
}

function renderHarness() {
  return render(
    <AccentColorProvider>
      <ToastProvider>
        <Harness />
      </ToastProvider>
    </AccentColorProvider>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('GlobalToast', () => {
  it('shows the toast when shown', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByText('Deployed!')).toBeInTheDocument();
  });

  it('auto-hides after 10 seconds', () => {
    vi.useFakeTimers();
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByText('Deployed!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.queryByText('Deployed!')).not.toBeInTheDocument();
  });

  it('hides when dismissed', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Deployed!')).not.toBeInTheDocument();
  });
});
