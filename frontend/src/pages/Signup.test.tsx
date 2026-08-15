import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/pages.tsx';

async function signUpAs(username: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('Username'), username);
  await user.type(screen.getByPlaceholderText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('Signup page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the signup form', async () => {
    const { unmount } = await renderWithRouter('/signup');
    expect(screen.getByRole('heading', { name: 'Welcome to Nohonu' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    unmount();
  });

  it('creates an account and navigates to the user page', async () => {
    const { router, clear, unmount } = await renderWithRouter('/signup');
    clear();

    await signUpAs('alice', 'secret123');

    await waitFor(() => expect(router.state.location.pathname).toBe('/u/alice'));
    expect(localStorage.getItem('sessionId')).toBe('sess-abc');
    unmount();
  });

  it('rejects an invalid username before submitting', async () => {
    const { router, unmount } = await renderWithRouter('/signup');

    await signUpAs('John Doe', 'secret123');

    expect(
      await screen.findByText(/Username must be 2-30 characters/)
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/signup');
    unmount();
  });
});
