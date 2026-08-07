import { useApi } from './useApi.ts';

export function useUpdateDisplayName() {
  const { apiFetch } = useApi();

  const updateDisplayName = async (displayName: string) => {
    const res = await apiFetch('/auth/displayname', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update display name');
    }
  };

  return { updateDisplayName };
}
