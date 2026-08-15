import { useQuery } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useCheckSiteId(siteId: string, username: string) {
  const { apiFetch } = useApiFetch();

  const query = useQuery({
    queryKey: ['check-site-id', siteId, username],
    queryFn: async () => {
      const res = await apiFetch(
        `/check-domain?siteId=${encodeURIComponent(siteId)}&user=${encodeURIComponent(username)}`
      );
      return { siteId, taken: res.ok };
    },
    enabled: !!siteId,
  });

  return {
    result: query.data ?? null,
    checking: query.isFetching,
  };
}
