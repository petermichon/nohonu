import { useMutation } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

export function useFetchVersionGithub(domain: string) {
  const { apiFetch } = useApiFetch();

  const mutation = useMutation({
    mutationFn: async ({ repo, branch }: { repo: string; branch: string }) => {
      const res = await apiFetch(`/sites/${domain}/versions/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo, branch }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Fetch failed');
      }
    },
  });

  return {
    fetchGithub: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
