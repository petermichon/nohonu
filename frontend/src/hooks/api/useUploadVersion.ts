import { useMutation } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useUploadVersion(domain: string) {
  const { apiFetch } = useApiFetch();

  const mutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const res = await apiFetch(`/sites/${domain}/versions`, {
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
    uploadVersion: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
