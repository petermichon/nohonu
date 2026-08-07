import { useQuery } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useCheckSubdomain(subdomain: string) {
  const { apiFetch } = useApiFetch();

  const query = useQuery({
    queryKey: ['check-subdomain', subdomain],
    queryFn: async () => {
      const res = await apiFetch(`/check-subdomain?subdomain=${encodeURIComponent(subdomain)}`);
      return { subdomain, taken: res.ok };
    },
    enabled: !!subdomain,
  });

  return {
    result: query.data ?? null,
    checking: query.isFetching,
  };
}
