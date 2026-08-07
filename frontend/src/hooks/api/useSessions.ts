import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '../../lib/types.ts';
import { useApiFetch } from './useApiFetch.ts';

export function useSessions() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await apiFetch('/auth/sessions');
      if (!res.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await res.json();
      return (data.sessions ?? []) as Session[];
    },
    retry: false,
  });

  const refreshSessions = () => queryClient.invalidateQueries({ queryKey: ['sessions'] });

  return {
    sessions: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? 'Failed to fetch sessions' : false,
    refreshSessions,
  };
}
