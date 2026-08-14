import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavButton } from './NavButton.tsx';

function IconHarness() {
  const [hasIconError, setHasIconError] = useState(false);
  return (
    <NavButton
      label="Nohonu"
      iconUrl="https://example.com/icon.png"
      hasIconError={hasIconError}
      onIconError={() => setHasIconError(true)}
      onClick={vi.fn()}
    />
  );
}

describe('NavButton', () => {
  it('renders a button with the label and calls onClick', () => {
    const onClick = vi.fn();
    render(<NavButton label="Sites" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Sites' });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies active styling when isActive', () => {
    render(<NavButton label="Sites" isActive onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Sites' })).toHaveClass(/bg-stone-100/);
  });

  it('shows the icon fallback letter when the image fails to load', () => {
    const { container } = render(<IconHarness />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    fireEvent.error(img);
    expect(screen.getByText('N')).toBeInTheDocument();
  });
});
