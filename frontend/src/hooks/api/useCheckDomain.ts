import { useQuery } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useCheckDomain(domain: string, username: string) {
  const { apiFetch } = useApiFetch();

  const query = useQuery({
    queryKey: ['check-domain', domain, username],
    queryFn: async () => {
      const res = await apiFetch(
        `/check-domain?domain=${encodeURIComponent(domain)}&user=${encodeURIComponent(username)}`
      );
      return { domain, taken: res.ok };
    },
    enabled: !!domain,
  });

  return {
    result: query.data ?? null,
    checking: query.isFetching,
  };
}
