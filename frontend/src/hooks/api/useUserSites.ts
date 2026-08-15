import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Site } from '../../lib/types.ts';
import { useApiFetch } from './useApiFetch.ts';

export function useUserSites(username: string | undefined) {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-sites', username],
    queryFn: async () => {
      if (!username) return [];
      const res = await apiFetch(`/users/${username}/sites`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('not-found');
        }
        throw new Error('connection');
      }
      const data = await res.json();
      return (data.sites ?? []) as Site[];
    },
    retry: false,
  });

  return {
    sites: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error && query.error.message === 'not-found'
        ? 'not-found'
        : 'connection'
      : false,
    refreshUserSites: () => queryClient.invalidateQueries({ queryKey: ['user-sites', username] }),
  };
}
