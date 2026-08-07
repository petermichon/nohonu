import { useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi.ts';

export function useDeleteCustomDomain() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const deleteCustomDomain = async (siteDomain: string, customDomain: string) => {
    const res = await apiFetch(`/sites/${siteDomain}/custom-domains/${customDomain}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to remove custom domain');
    }
    queryClient.invalidateQueries({ queryKey: ['custom-domains', siteDomain] });
    queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
  };

  return { deleteCustomDomain };
}
