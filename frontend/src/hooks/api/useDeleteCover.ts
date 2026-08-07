import { useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi.ts';

export function useDeleteCover(domain: string) {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const deleteCover = async () => {
    const res = await apiFetch(`/sites/${domain}/cover`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete cover');
    }
    queryClient.invalidateQueries({ queryKey: ['site', domain] });
  };

  return { deleteCover };
}
