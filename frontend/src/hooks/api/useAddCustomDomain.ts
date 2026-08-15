import { useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useAddCustomDomain() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const addCustomDomain = async (username: string, siteId: string, customDomain: string) => {
    const res = await apiFetch(`/users/${username}/sites/${siteId}/custom-domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customDomain }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to add custom domain');
    }
    queryClient.invalidateQueries({ queryKey: ['custom-domains', siteId] });
    queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
  };

  return { addCustomDomain };
}
