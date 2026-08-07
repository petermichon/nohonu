import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useUserStars(username: string | undefined) {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-stars', username],
    queryFn: async () => {
      if (!username) return [];
      const res = await apiFetch(`/users/${username}/stars`);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error('connection');
      }
      const data = await res.json();
      return data.sites ?? [];
    },
  });

  return {
    stars: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? 'connection' : false,
    refreshStars: () => queryClient.invalidateQueries({ queryKey: ['user-stars', username] }),
  };
}
