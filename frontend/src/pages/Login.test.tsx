import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/pages.tsx';

async function loginAs(username: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('Username'), username);
  await user.type(screen.getByPlaceholderText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('Login page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the login form', async () => {
    const { unmount } = await renderWithRouter('/login');
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    unmount();
  });

  it('logs in with valid credentials and navigates to the user page', async () => {
    const { router, clear, unmount } = await renderWithRouter('/login');
    clear();

    await loginAs('peter', 'secret');

    await waitFor(() => expect(router.state.location.pathname).toBe('/u/peter'));
    expect(localStorage.getItem('sessionId')).toBe('sess-abc');
    unmount();
  });

  it('shows an error message for invalid credentials', async () => {
    const { unmount } = await renderWithRouter('/login');
    await loginAs('peter', 'wrong');

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(localStorage.getItem('sessionId')).toBeNull();
    unmount();
  });
});
