import { useApi } from './useApi.ts';

export function useUpdateSiteMeta() {
  const { apiFetch } = useApi();

  const updateSiteMeta = async (domain: string, displayName: string) => {
    const res = await apiFetch(`/sites/${domain}/meta`, {
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
