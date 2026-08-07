import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Site } from '../../lib/types.ts';
import { useApiFetch } from './useApiFetch.ts';

export function useExploreSites() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['explore-sites'],
    queryFn: async () => {
      const res = await apiFetch('/explore/sites');
      if (!res.ok) {
        throw new Error('connection');
      }
      const data = await res.json();
      return (data.sites ?? []) as Site[];
    },
    retry: false,
  });

  const refreshExploreSites = () => queryClient.invalidateQueries({ queryKey: ['explore-sites'] });

  return {
    sites: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? 'connection' : false,
    refreshExploreSites,
  };
}
