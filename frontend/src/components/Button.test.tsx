import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button.tsx';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders a button by default', () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole('button').tagName).toBe('BUTTON');
  });

  it('applies default and custom classes', () => {
    render(<Button className="custom-class">Styled</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
    expect(screen.getByRole('button')).toHaveClass(/bg-zinc-900/);
  });

  it('renders as an anchor when as="a"', () => {
    render(
      <Button as="a" href="/somewhere">
        Link
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveAttribute('href', '/somewhere');
  });

  it('forwards extra button props', () => {
    render(
      <Button type="submit" aria-label="Submit form">
        Go
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Submit form' })).toHaveAttribute('type', 'submit');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Press
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
