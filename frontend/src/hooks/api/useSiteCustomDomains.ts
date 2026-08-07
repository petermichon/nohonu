import { useQuery } from '@tanstack/react-query';
import type { Domain } from '../../lib/types.ts';
import { useApiFetch } from './useApiFetch.ts';

export function useSiteCustomDomains(domain: string) {
  const { apiFetch } = useApiFetch();

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
