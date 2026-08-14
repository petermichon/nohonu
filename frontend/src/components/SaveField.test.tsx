import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveField } from './SaveField.tsx';

describe('SaveField', () => {
  it('renders the label and input with the current value', () => {
    render(<SaveField label="Display name" htmlFor="display-name" value="Peter" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Display name')).toHaveValue('Peter');
  });

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SaveField label="Display name" htmlFor="display-name" value="" onChange={onChange} />);
    await user.type(screen.getByLabelText('Display name'), 'x');
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onSave when Save is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SaveField label="Display name" htmlFor="display-name" value="Peter" onChange={vi.fn()} onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('disables the Save button when saveDisabled', () => {
    render(
      <SaveField label="Display name" htmlFor="display-name" value="Peter" onChange={vi.fn()} onSave={vi.fn()} saveDisabled />
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('renders a custom action slot instead of the default button', () => {
    render(
      <SaveField
        label="Display name"
        htmlFor="display-name"
        value="Peter"
        onChange={vi.fn()}
        action={<button type="button">Custom</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('renders a custom button content', () => {
    render(
      <SaveField
        label="Display name"
        htmlFor="display-name"
        value="Peter"
        onChange={vi.fn()}
        buttonContent="Update"
      />
    );
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });
});
