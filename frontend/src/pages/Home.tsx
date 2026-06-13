import { Link } from 'react-router-dom';
import { Rocket, Globe, Server, ChevronRight, Eye } from 'lucide-react';
import { useSites } from '../lib/SitesProvider.tsx';
import { formatHits } from '../lib/utils.ts';

function Home() {
  const { sites, loading, error } = useSites();

  const onlineCount = sites.filter((s) => s.enabled).length;
  const offlineCount = sites.filter((s) => !s.enabled).length;
  const totalHits = sites.reduce((acc, s) => acc + s.hits, 0);

  return (
    <section className="mb-12">
      <h1 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-6">Home</h1>

      {/* Live summary strip — only shown when data is available */}
      {!error && (
        <div className="flex items-center gap-6 mb-6">
          {loading ? (
            <>
              <div className="h-8 w-24 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
              <div className="h-8 w-24 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
              <div className="h-8 w-24 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
            </>
          ) : sites.length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  <span className="font-semibold">{onlineCount}</span> online
                </span>
              </div>
              {offlineCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-600 shrink-0" />
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    <span className="font-semibold">{offlineCount}</span> offline
                  </span>
                </div>
              )}
              {totalHits > 0 && (
                <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{formatHits(totalHits)} total hits</span>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sites Card */}
        <Link
          to="/sites"
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 hover:border-stone-300 dark:hover:border-stone-700 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 dark:text-stone-600 group-hover:text-stone-600 dark:group-hover:text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">Sites</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {loading
              ? 'Manage your monitored sites'
              : sites.length > 0
                ? `${sites.length} site${sites.length === 1 ? '' : 's'}`
                : 'Manage your monitored sites'}
          </p>
        </Link>

        {/* Domains Card */}
        <Link
          to="/domains"
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 hover:border-stone-300 dark:hover:border-stone-700 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 dark:text-stone-600 group-hover:text-stone-600 dark:group-hover:text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">Domains</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">Configure your domains</p>
        </Link>

        {/* Servers Card */}
        <Link
          to="/servers"
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 hover:border-stone-300 dark:hover:border-stone-700 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Server className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 dark:text-stone-600 group-hover:text-stone-600 dark:group-hover:text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">Servers</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">Manage your servers</p>
        </Link>
      </div>
    </section>
  );
}

export default Home;
