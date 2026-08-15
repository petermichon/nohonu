import { useQueryClient } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useUploadCover(username: string, siteId: string) {
  const { apiFetch } = useApiFetch();
  const queryClient = useQueryClient();

  const uploadCover = async (file: File) => {
    const res = await apiFetch(`/users/${username}/sites/${siteId}/cover`, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to upload cover');
    }
    queryClient.invalidateQueries({ queryKey: ['site', siteId] });
  };

  return { uploadCover };
}
