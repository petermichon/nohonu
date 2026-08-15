import { useMutation } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

interface CreateSiteParams {
  username: string;
  file: File;
  siteId: string;
  subdomain: string;
}

export function useCreateSite() {
  const { apiFetch } = useApiFetch();

  const mutation = useMutation({
    mutationFn: async ({ username, file, siteId, subdomain }: CreateSiteParams) => {
      const query = subdomain ? `?subdomain=${encodeURIComponent(subdomain)}` : '';
      const res = await apiFetch(`/users/${username}/sites/${siteId}${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/zip' },
        body: file,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
    },
  });

  return {
    createSite: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
