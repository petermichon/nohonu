import { useQuery } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useVerificationToken(domain: string) {
  const { apiFetch } = useApiFetch();

  const query = useQuery({
    queryKey: ['verification-token', domain],
    queryFn: async () => {
      const res = await apiFetch(`/sites/${domain}/custom-domains/token`);
      const data = await res.json();
      return data.token as string;
    },
    retry: false,
  });

  return {
    verificationToken: query.data ?? null,
  };
}
