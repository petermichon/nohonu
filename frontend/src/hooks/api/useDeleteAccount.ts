import { useApiFetch } from './useApiFetch.ts';

export function useDeleteAccount() {
  const { apiFetch } = useApiFetch();

  const deleteAccount = async (password: string) => {
    const res = await apiFetch('/auth/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to delete account');
    }
  };

  return { deleteAccount };
}