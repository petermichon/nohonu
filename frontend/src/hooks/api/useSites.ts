import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Site } from '../../lib/types.ts';
import { useApiFetch } from './useApiFetch.ts';

export function useSites() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const res = await apiFetch('/sites');
      if (res.status === 401) {
        throw new Error('unauthorized');
      }
      if (!res.ok) {
        throw new Error('request failed');
      }
      const data = await res.json();
      return (data.sites ?? []) as Site[];
    },
    retry: false,
  });

  const refreshSites = () => queryClient.invalidateQueries({ queryKey: ['sites'] });

  return {
    sites: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error.message === 'unauthorized' ? 'unauthorized' : 'connection') : false,
    refreshSites,
  };
}
