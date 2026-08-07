import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Domain } from '../../lib/types.ts';
import { useApiFetch } from './useApiFetch.ts';

export function useDomains() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['custom-domains'],
    queryFn: async () => {
      const res = await apiFetch('/custom-domains');
      const data = await res.json();
      return (data.customDomains ?? []) as Domain[];
    },
    retry: false,
  });

  const refreshDomains = () => queryClient.invalidateQueries({ queryKey: ['custom-domains'] });

  return {
    domains: query.data ?? [],
    loading: query.isLoading,
    refreshDomains,
  };
}
