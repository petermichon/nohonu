import { useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi.ts';

export function useLogout() {
  const { apiFetch } = useApi();
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
