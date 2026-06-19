import { Server, Globe } from 'lucide-react';
import { BackButton } from '../components/BackButton.tsx';
import { Link, useLocation, useParams } from 'react-router-dom';

function Servers() {
  const location = useLocation();
  const { username } = useParams<{ username?: string }>();

  const isUserScoped = !!username;
  const tabs = isUserScoped
    ? [
        { to: `/u/${username}`, label: 'Sites', icon: null },
        { to: `/u/${username}/domains`, label: 'Domains', icon: Globe },
        { to: `/u/${username}/servers`, label: 'Servers', icon: Server },
      ]
    : null;

  return (
    <section className="mb-12">
      <div className="mb-5">
        <BackButton to={isUserScoped ? `/u/${username}` : '/'} label={isUserScoped ? 'User' : 'Home'} />
      </div>

      {/* Tab navigation */}
      {tabs && (
        <div className="flex gap-1 mb-6">
          {tabs.map((tab) => {
            const isActive =
              location.pathname === tab.to || (tab.to !== `/u/${username}` && location.pathname.startsWith(tab.to));
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">Servers</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">Manage server settings and configuration</p>
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Server className="w-6 h-6 text-stone-400 dark:text-stone-500" />
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Server configuration coming soon</p>
          <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">Configure your server settings</p>
        </div>
      </div>
    </section>
  );
}

export default Servers;
