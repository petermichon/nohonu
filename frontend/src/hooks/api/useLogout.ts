import { useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useLogout() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const logout = async () => {
    const res = await apiFetch('/auth/logout', { method: 'POST' });
    if (!res.ok) {
      throw new Error('Failed to logout');
    }
    queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  return { logout };
}
