import { useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useUpdateSiteConfig() {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const updateSiteConfig = async (subdomain: string | null) => {
    const res = await apiFetch(`/sites/meta`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subdomain }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update subdomain');
    }
    queryClient.invalidateQueries({ queryKey: ['site-meta'] });
  };

  return { updateSiteConfig };
}
