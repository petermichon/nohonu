import { useQuery } from '@tanstack/react-query';
import { useConnection } from '../../providers/ConnectionProvider.tsx';
import { useApi } from './useApi.ts';
import type { Me } from '../../lib/types.ts';

export function useMe() {
  const { sessionId } = useConnection();
  const { apiFetch } = useApi();

  const query = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await apiFetch('/auth/me');
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await res.json();
      return (data.user ?? {}) as Me;
    },
    enabled: !!sessionId,
    retry: false,
  });

  return {
    user: query.data ?? null,
    loading: query.isLoading,
  };
}
