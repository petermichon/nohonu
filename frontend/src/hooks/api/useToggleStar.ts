import { useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useToggleStar() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const toggleStar = async (domain: string, isStarred: boolean) => {
    const res = await apiFetch(`/sites/${domain}/star`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred: isStarred }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update star');
    }
    queryClient.invalidateQueries({ queryKey: ['explore-sites'] });
    queryClient.invalidateQueries({ queryKey: ['sites'] });
    queryClient.invalidateQueries({ queryKey: ['user-sites'] });
    queryClient.invalidateQueries({ queryKey: ['user-stars'] });
  };

  return { toggleStar };
}
