import { useQuery } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useVerificationToken(username: string, siteId: string) {
  const { apiFetch } = useApiFetch();

  const query = useQuery({
    queryKey: ['verification-token', siteId],
    queryFn: async () => {
      const res = await apiFetch(`/users/${username}/sites/${siteId}/custom-domains/token`);
      const data = await res.json();
      return data.token as string;
    },
    retry: false,
  });

  return {
    verificationToken: query.data ?? null,
  };
}
