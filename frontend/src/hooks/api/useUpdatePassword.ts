import { useApiFetch } from './useApiFetch.ts';

export function useUpdatePassword() {
  const { apiFetch } = useApiFetch();

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    const res = await apiFetch('/auth/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to change password');
    }
  };

  return { updatePassword };
}
