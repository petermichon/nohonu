import { useNavigate } from '@tanstack/react-router';
import { InlineDeployForm } from '../components/InlineDeployForm.tsx';
import { useSites } from '../lib/api.ts';
import { useConnection } from '../lib/ConnectionProvider.tsx';

export default function Deploy() {
  const navigate = useNavigate();
  const { refreshSites } = useSites();
  const { username } = useConnection();

  const handleDeploy = (domain: string) => {
    refreshSites();
    if (username) {
      navigate({ to: `/u/${username}/${domain}` });
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Deploy a site</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Upload a .zip file or connect a GitHub repository to deploy your site.
        </p>
        <InlineDeployForm onDeploy={handleDeploy} />
      </div>
    </section>
  );
}
