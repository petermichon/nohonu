import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select.tsx';

describe('Select', () => {
  it('renders the provided options', () => {
    render(
      <Select>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveLength(2);
  });

  it('renders with an accessible name from a label', () => {
    render(
      <>
        <label htmlFor="site">Site</label>
        <Select id="site">
          <option value="a">A</option>
        </Select>
      </>
    );
    expect(screen.getByLabelText('Site')).toBeInTheDocument();
  });

  it('forwards value and onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select value="a" onChange={onChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('a');
    await user.selectOptions(select, 'b');
    expect(onChange).toHaveBeenCalled();
  });

  it('applies custom classes alongside base classes', () => {
    render(
      <Select className="extra">
        <option value="a">A</option>
      </Select>
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('extra');
    expect(select).toHaveClass(/rounded-full/);
  });
});