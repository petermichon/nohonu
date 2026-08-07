import { useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi.ts';

export function useUploadCover(domain: string) {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const uploadCover = async (file: File) => {
    const res = await apiFetch(`/sites/${domain}/cover`, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to upload cover');
    }
    queryClient.invalidateQueries({ queryKey: ['site', domain] });
  };

  return { uploadCover };
}
