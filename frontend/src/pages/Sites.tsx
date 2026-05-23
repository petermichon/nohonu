import { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle, Search, LayoutGrid, Rows3 } from 'lucide-react';
import { SiteCard } from '../components/SiteCard';
import { InlineDeployForm } from '../components/InlineDeployForm';
import { ConfirmModal } from '../lib/ConfirmModal';
import { useApi } from '../lib/api';
import type { Site } from '../lib/types';

function Sites() {
  const { apiFetch } = useApi();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{ domain: string; enabled: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'normal' | 'compact'>('normal');

  const loadSites = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiFetch('/sites');
      const data = await res.json();
      setSites(data.sites || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSites(); }, []);

  const handleToggle = async () => {
    if (!confirmToggle) return;
    const { domain } = confirmToggle;
    setToggling(domain);
    setConfirmToggle(null);
    try {
      await apiFetch(`/sites/${domain}/toggle`, { method: 'PATCH' });
      await loadSites();
    } catch {
      // Silent fail
    } finally {
      setToggling(null);
    }
  };

  const filteredSites = useMemo(() => {
    const filtered = sites.filter(s =>
      s.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) =>
      b.enabled === a.enabled ? a.domain.localeCompare(b.domain) : b.enabled ? 1 : -1
    );
  }, [sites, searchQuery]);

  const stats = useMemo(() => ({
    enabled: sites.filter(s => s.enabled).length,
    disabled: sites.filter(s => !s.enabled).length,
  }), [sites]);

  return (
    <section className="mb-12">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-stone-900 dark:text-stone-100">Sites</h1>
          {!loading && !error && sites.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                {stats.enabled}
              </span>
              {stats.disabled > 0 && (
                <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-600 inline-block" />
                  {stats.disabled}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!loading && !error && sites.length > 0 && (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter..."
                  className="w-32 sm:w-40 pl-8 pr-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 transition-colors"
                />
              </div>
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('normal')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'normal'
                      ? 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-sm'
                      : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400'
                  }`}
                  title="Normal view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'compact'
                      ? 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-sm'
                      : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400'
                  }`}
                  title="Compact view"
                >
                  <Rows3 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-stone-400 dark:text-stone-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Can't connect to server</p>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">Please check if the server is running</p>
        </div>
      ) : sites.length === 0 ? (
        <div className="max-w-md mx-auto">
          <InlineDeployForm onDeploy={loadSites} mode="normal" />
        </div>
      ) : (
        <>
          {/* Both modes use single column - cards take full width, different styling */}
          <div className="flex flex-col gap-3">
            {/* Site cards */}
            {filteredSites.map((site) => (
              <SiteCard
                key={site.domain}
                site={site}
                mode={viewMode}
                onToggle={(d) => setConfirmToggle({ domain: d, enabled: sites.find(s => s.domain === d)?.enabled ?? false })}
                loading={toggling}
              />
            ))}

            {/* Deploy form card - at the end */}
            <InlineDeployForm onDeploy={loadSites} mode={viewMode} />
          </div>

          {/* Empty state for search */}
          {filteredSites.length === 0 && searchQuery && (
            <div className="text-center py-12 mt-4">
              <p className="text-sm text-stone-500 dark:text-stone-400">No sites match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 mt-1"
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
    </section>
  );
}

export default Sites;
