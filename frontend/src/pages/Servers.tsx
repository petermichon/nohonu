import { Server } from 'lucide-react';
import { BackButton } from '../components/BackButton.tsx';
import { useParams } from 'react-router-dom';

function Servers() {
  const { username } = useParams<{ username?: string }>();

  const isUserScoped = !!username;

  return (
    <section className="mb-12 px-6">
      <div className="mb-5">
        <BackButton to={isUserScoped ? `/u/${username}` : '/'} label={isUserScoped ? 'User' : 'Home'} />
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Servers</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Manage server settings and configuration</p>
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Server className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Server configuration coming soon</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Configure your server settings</p>
        </div>
      </div>
    </section>
  );
}

export default Servers;
