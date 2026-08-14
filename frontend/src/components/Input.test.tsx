import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input.tsx';

describe('Input', () => {
  it('renders an input with the given placeholder', () => {
    render(<Input placeholder="Search…" />);
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
  });

  it('renders with an accessible name from a label', () => {
    render(
      <>
        <label htmlFor="domain">Domain</label>
        <Input id="domain" />
      </>
    );
    expect(screen.getByLabelText('Domain')).toBeInTheDocument();
  });

  it('forwards value and onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input value="hello" onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('hello');
    await user.type(input, 'x');
    expect(onChange).toHaveBeenCalled();
  });

  it('updates value as the user types', async () => {
    const user = userEvent.setup();
    render(<Input defaultValue="" />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'nohonu');
    expect(input).toHaveValue('nohonu');
  });

  it('applies custom classes alongside base classes', () => {
    render(<Input className="extra" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('extra');
    expect(input).toHaveClass(/rounded-full/);
  });
});
