import { useApiFetch } from './useApiFetch.ts';

export function useUpdateSiteMeta() {
  const { apiFetch } = useApiFetch();

  const updateSiteMeta = async (username: string, siteId: string, displayName: string) => {
    const res = await apiFetch(`/users/${username}/sites/${siteId}/meta`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update site meta');
    }
  };

  return { updateSiteMeta };
}
