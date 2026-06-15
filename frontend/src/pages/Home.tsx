import { Eye, AlertCircle } from 'lucide-react';
import { useSites } from '../lib/SitesProvider.tsx';
import { formatHits } from '../lib/utils.ts';
import { HomeSiteCard } from '../components/HomeSiteCard.tsx';

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
          {Array.from({ length: 6 }).map((_, i) => (
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
      {!loading && !error && sites.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-stone-500 dark:text-stone-400">No sites deployed yet</p>
        </div>
      )}

      {/* Sites grid */}
      {!loading && !error && sites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <HomeSiteCard key={site.domain} site={site} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Home;
