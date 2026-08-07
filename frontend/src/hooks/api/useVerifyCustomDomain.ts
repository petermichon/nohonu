import { useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi.ts';

export function useVerifyCustomDomain() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const verifyCustomDomain = async (siteDomain: string, customDomain: string) => {
    const res = await apiFetch(`/sites/${siteDomain}/custom-domains/${customDomain}/verify`, {
      method: 'POST',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Verification failed');
    }
    queryClient.invalidateQueries({ queryKey: ['custom-domains', siteDomain] });
    queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
  };

  return { verifyCustomDomain };
}
