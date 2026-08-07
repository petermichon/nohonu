import { useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useAddCustomDomain() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const addCustomDomain = async (siteDomain: string, customDomain: string) => {
    const res = await apiFetch(`/sites/${siteDomain}/custom-domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customDomain }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to add custom domain');
    }
    queryClient.invalidateQueries({ queryKey: ['custom-domains', siteDomain] });
    queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
  };

  return { addCustomDomain };
}
