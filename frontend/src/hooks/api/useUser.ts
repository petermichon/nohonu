import { useQuery } from '@tanstack/react-query';
import { useApi } from './useApi.ts';

export function useUser(username: string | undefined) {
  const { apiFetch } = useApi();

  const query = useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      if (!username) return null;
      const res = await apiFetch(`/users/${username}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('not-found');
        }
        throw new Error('connection');
      }
      const data = await res.json();
      return data.user as { username: string; displayName: string; profilePicture?: string } | null;
    },
  });

  return {
    user: query.data,
    loading: query.isLoading,
    error: query.error ? 'connection' : false,
  };
}
