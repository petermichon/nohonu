import { useQuery } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useRepoHistory(domain: string) {
  const { apiFetch } = useApiFetch();

  const query = useQuery({
    queryKey: ['repo-history', domain],
    queryFn: async () => {
      const res = await apiFetch(`/sites/${domain}/repos`);
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
