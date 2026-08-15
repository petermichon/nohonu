import { useQuery } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useRepoHistory(username: string, siteId: string) {
  const { apiFetch } = useApiFetch();

  const query = useQuery({
    queryKey: ['repo-history', siteId],
    queryFn: async () => {
      const res = await apiFetch(`/users/${username}/sites/${siteId}/repos`);
      const data = await res.json();
      return (data.history as { repo: string; branch: string; lastUsed: number }[]) ?? [];
    },
    enabled: false,
  });

  return {
    history: query.data ?? [],
    refetch: query.refetch,
  };
}
