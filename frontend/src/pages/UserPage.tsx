import { useParams, Link, useLocation } from 'react-router-dom';
import { User, AlertCircle, Globe, Server } from 'lucide-react';
import { BackButton } from '../components/BackButton.tsx';
import { HomeSiteCard } from '../components/HomeSiteCard.tsx';
import { useSites } from '../lib/SitesProvider.tsx';

export default function UserPage() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { sites, loading, error } = useSites();

  const userSites = sites.filter((s) => s.account === username);

  const tabs = [
    { to: `/u/${username}`, label: 'Sites', icon: null },
    { to: `/u/${username}/domains`, label: 'Domains', icon: Globe },
    { to: `/u/${username}/servers`, label: 'Servers', icon: Server },
  ];

  return (
    <section className="mb-12">
      <div className="mb-5">
        <BackButton to="/" label="Home" />
      </div>

      {/* Tab navigation */}
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

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-stone-500 dark:text-stone-400" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-stone-900 dark:text-stone-100">@{username}</h1>
          {!loading && !error && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {userSites.length === 1 ? '1 site' : `${userSites.length} sites`}
            </p>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-purple-500 dark:text-purple-400" />
          </div>
          {error === 'unauthorized' ? (
            <>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Invalid API key</p>
              <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
                Update your API key in connection settings
              </p>
            </>
          ) : (
            <>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Can't connect to server</p>
              <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">Please check if the server is running</p>
            </>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden"
            >
              <div className="w-full h-32 bg-stone-100 dark:bg-stone-800 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-24 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && userSites.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-stone-500 dark:text-stone-400">No sites published by @{username}</p>
        </div>
      )}

      {/* Sites grid */}
      {!loading && !error && userSites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userSites.map((site) => (
            <HomeSiteCard key={site.domain} site={site} />
          ))}
        </div>
      )}
    </section>
  );
}
