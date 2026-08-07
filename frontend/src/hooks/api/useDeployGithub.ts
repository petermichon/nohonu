import { useMutation } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';

interface DeployGithubParams {
  domain: string;
  repo: string;
  branch: string;
  subdomain: string;
}

export function useDeployGithub() {
  const { apiFetch } = useApiFetch();

  const mutation = useMutation({
    mutationFn: async ({ domain, repo, branch, subdomain }: DeployGithubParams) => {
      const body: { repo: string; branch: string; subdomain?: string } = { repo, branch };
      if (subdomain) {
        body.subdomain = subdomain;
      }
      const res = await apiFetch(`/sites/${domain}/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Fetch failed');
      }
    },
  });

  return {
    deployGithub: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
