import { useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi.ts';

export function useDeleteSession() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const deleteSession = async (sessionId: string) => {
    const res = await apiFetch(`/auth/sessions/delete?id=${sessionId}`, { method: 'DELETE' });
    if (!res.ok) {
      throw new Error('Failed to delete session');
    }
    await queryClient.invalidateQueries({ queryKey: ['sessions'] });
  };

  return { deleteSession };
}
