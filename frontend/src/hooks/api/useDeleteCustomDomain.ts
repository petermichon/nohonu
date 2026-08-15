import { useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useDeleteCustomDomain() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const deleteCustomDomain = async (username: string, siteId: string, customDomain: string) => {
    const res = await apiFetch(`/users/${username}/sites/${siteId}/custom-domains/${customDomain}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to remove custom domain');
    }
    queryClient.invalidateQueries({ queryKey: ['custom-domains', siteId] });
    queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
  };

  return { deleteCustomDomain };
}
