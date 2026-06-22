import { useState, useMemo } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { SiteCard } from '../components/SiteCard.tsx';
import { InlineDeployForm } from '../components/InlineDeployForm.tsx';
import { ConfirmModal } from '../lib/ConfirmModal.tsx';
import { useApi } from '../lib/api.ts';
import { useSites } from '../lib/SitesProvider.tsx';
import { useToast } from '../lib/ToastContext.tsx';
import { Footer } from '../components/Footer.tsx';

function Sites() {
  const { apiFetch } = useApi();
  const { sites, loading, error, refreshSites } = useSites();
  const { showToast } = useToast();
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{ domain: string; enabled: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = async () => {
    if (!confirmToggle) return;
    const { domain, enabled } = confirmToggle;
    setToggling(domain);
    setConfirmToggle(null);
    try {
      await apiFetch(`/sites/${domain}/toggle`, { method: 'PATCH' });
      await refreshSites();
      showToast(`Site ${enabled ? 'disabled' : 'enabled'}`, true);
    } catch {
      showToast('Failed to update site', false);
    } finally {
      setToggling(null);
    }
  };

  const filteredSites = useMemo(() => {
    const filtered = sites.filter((s) => s.domain.toLowerCase().includes(searchQuery.toLowerCase()));
    return filtered.sort((a, b) => (b.enabled === a.enabled ? a.domain.localeCompare(b.domain) : b.enabled ? 1 : -1));
  }, [sites, searchQuery]);

  const stats = useMemo(
    () =>
      sites.reduce(
        (acc, s) => {
          if (s.enabled) {
            acc.enabled++;
          } else {
            acc.disabled++;
          }
          return acc;
        },
        { enabled: 0, disabled: 0 }
      ),
    [sites]
  );

  return (
    <section className="px-6 pt-12">
      <div className="flex gap-6 relative">
        <div className="flex-1 min-w-0">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Sites</h1>
              <div className="flex items-center gap-1.5">
                {error || sites.length === 0 ? (
                  <div className="w-12 h-5" />
                ) : (
                  <>
                    <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                      {stats.enabled}
                    </span>
                    {stats.disabled > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-600 inline-block" />
                        {stats.disabled}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  id="siteSearch"
                  name="siteSearch"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter..."
                  disabled={loading || !!error || sites.length === 0}
                  className="w-32 sm:w-40 pl-8 pr-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          {error ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-purple-500 dark:text-purple-400" />
              </div>
              {error === 'unauthorized' ? (
                <>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Invalid API key</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                    Update your API key in connection settings
                  </p>
                </>
              ) : (
                <>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Can't connect to server</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Please check if the server is running</p>
                  <button
                    type="button"
                    onClick={refreshSites}
                    className="mt-3 px-3 py-1.5 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-zinc-900 rounded-lg hover:bg-stone-700 dark:hover:bg-stone-300"
                  >
                    Retry
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {/* Site cards */}
                {loading ? (
                  <>
                    <div className="group flex items-center gap-4 px-4 py-3 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 animate-pulse">
                      {/* Accent strip */}
                      <div className="shrink-0 w-1 self-stretch rounded-full bg-stone-200 dark:bg-stone-700" />
                      {/* Favicon */}
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800" />
                      {/* Domain + URL */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-32 bg-stone-100 dark:bg-stone-800 rounded" />
                        <div className="h-3 w-40 bg-stone-100 dark:bg-stone-800 rounded" />
                      </div>
                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="h-4 w-12 bg-stone-100 dark:bg-stone-800 rounded" />
                        <div className="h-4 w-12 bg-stone-100 dark:bg-stone-800 rounded" />
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800" />
                        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800" />
                      </div>
                    </div>
                    <div className="group flex items-center gap-4 px-4 py-3 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 animate-pulse">
                      {/* Accent strip */}
                      <div className="shrink-0 w-1 self-stretch rounded-full bg-stone-200 dark:bg-stone-700" />
                      {/* Favicon */}
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800" />
                      {/* Domain + URL */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-32 bg-stone-100 dark:bg-stone-800 rounded" />
                        <div className="h-3 w-40 bg-stone-100 dark:bg-stone-800 rounded" />
                      </div>
                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="h-4 w-12 bg-stone-100 dark:bg-stone-800 rounded" />
                        <div className="h-4 w-12 bg-stone-100 dark:bg-stone-800 rounded" />
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800" />
                        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800" />
                      </div>
                    </div>
                  </>
                ) : (
                  filteredSites.map((site) => (
                    <SiteCard
                      key={site.domain}
                      site={site}
                      onToggle={(d) =>
                        setConfirmToggle({ domain: d, enabled: sites.find((s) => s.domain === d)?.enabled ?? false })
                      }
                      loading={toggling}
                    />
                  ))
                )}

                {/* Deploy form card - always visible */}
                <InlineDeployForm onDeploy={refreshSites} />
              </div>

              {/* Empty state for search */}
              {!loading && filteredSites.length === 0 && searchQuery && (
                <div className="text-center py-12 mt-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No sites match "{searchQuery}"</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 mt-1"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </>
          )}

          {/* Confirm modal for toggle */}
          <ConfirmModal
            isOpen={!!confirmToggle}
            onClose={() => setConfirmToggle(null)}
            onConfirm={handleToggle}
            action={confirmToggle?.enabled ? 'disable' : 'enable'}
            domain={confirmToggle?.domain ?? ''}
            loading={toggling === confirmToggle?.domain}
          />
        </div>
      </div>
      <Footer />
    </section>
  );
}

export default Sites;
