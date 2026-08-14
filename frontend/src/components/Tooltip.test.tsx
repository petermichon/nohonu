import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip.tsx';

describe('Tooltip', () => {
  it('shows the tooltip content on hover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Delete this site">
        <button type="button">Trash</button>
      </Tooltip>
    );
    expect(screen.queryByText('Delete this site')).not.toBeInTheDocument();
    await user.hover(screen.getByRole('button', { name: 'Trash' }));
    expect(screen.getByText('Delete this site')).toBeInTheDocument();
  });

  it('hides the tooltip when the mouse leaves', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Delete this site">
        <button type="button">Trash</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Trash' }));
    expect(screen.getByText('Delete this site')).toBeInTheDocument();
    await user.unhover(screen.getByRole('button', { name: 'Trash' }));
    expect(screen.queryByText('Delete this site')).not.toBeInTheDocument();
  });

  it('hides the tooltip when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Delete this site">
        <button type="button">Trash</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Trash' }));
    expect(screen.getByText('Delete this site')).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByText('Delete this site')).not.toBeInTheDocument();
  });

  it('renders the children', () => {
    render(
      <Tooltip content="tip">
        <button type="button">Trash</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: 'Trash' })).toBeInTheDocument();
  });
});
