import { useQuery } from '@tanstack/react-query';
import type { Domain } from '../../lib/types.ts';
import { useApiFetch } from './useApiFetch.ts';

export function useSiteCustomDomains(username: string, siteId: string) {
  const { apiFetch } = useApiFetch();

  const query = useQuery({
    queryKey: ['custom-domains', siteId],
    queryFn: async () => {
      const res = await apiFetch(`/users/${username}/sites/${siteId}/custom-domains`);
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
