import { useQuery } from '@tanstack/react-query';
import type { Domain } from '../../lib/types.ts';
import { useApi } from './useApi.ts';

export function useSiteCustomDomains(domain: string) {
  const { apiFetch } = useApi();

  const query = useQuery({
    queryKey: ['custom-domains', domain],
    queryFn: async () => {
      const res = await apiFetch(`/sites/${domain}/custom-domains`);
      const data = await res.json();
      return (data.customDomains as Domain[]) ?? [];
    },
    retry: false,
  });

  return {
    customDomains: query.data ?? [],
    loading: query.isLoading,
  };
}
