import { useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useDeleteCover(username: string, siteId: string) {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const deleteCover = async () => {
    const res = await apiFetch(`/users/${username}/sites/${siteId}/cover`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete cover');
    }
    queryClient.invalidateQueries({ queryKey: ['site', siteId] });
  };

  return { deleteCover };
}
