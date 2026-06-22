import { useState, useEffect, useCallback } from 'react';
import { Globe, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/api.ts';
import { useToast } from '../lib/ToastContext.tsx';
import { Footer } from '../components/Footer.tsx';

interface CustomDomainEntry {
  siteDomain: string;
  customDomain: string;
  verified: boolean;
}

function Domains() {
  const { apiFetch } = useApi();
  const { showToast } = useToast();
  const [allDomains, setAllDomains] = useState<CustomDomainEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);

  const loadDomains = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/custom-domains');
      const data = await res.json();
      setAllDomains((data.customDomains as CustomDomainEntry[]) ?? []);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    (async () => {
      await loadDomains();
    })();
  }, [loadDomains]);

  const verifyCustomDomain = async (siteDomain: string, customDomain: string) => {
    setVerifyingDomain(customDomain);
    try {
      const res = await apiFetch(`/sites/${siteDomain}/custom-domains/${customDomain}/verify`, {
        method: 'POST',
      });
      if (res.ok) {
        await loadDomains();
        showToast('Custom domain verified', true);
      } else {
        const data = await res.json();
        showToast(data.message || 'Verification failed', false);
      }
    } catch {
      showToast('Verification failed', false);
    } finally {
      setVerifyingDomain(null);
    }
  };

  const deleteCustomDomain = async (siteDomain: string, customDomain: string) => {
    setDeletingDomain(customDomain);
    try {
      const res = await apiFetch(`/sites/${siteDomain}/custom-domains/${customDomain}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadDomains();
        showToast('Custom domain removed', true);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to remove custom domain', false);
      }
    } catch {
      showToast('Failed to remove custom domain', false);
    } finally {
      setDeletingDomain(null);
    }
  };

  return (
    <section className="mb-12 px-6 pt-12">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Domains</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Manage your custom domains</p>

        {loading ? (
          <div className="space-y-2">
            <div className="h-10 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
            <div className="h-10 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
          </div>
        ) : allDomains.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No custom domains configured</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Add a custom domain to your sites</p>
            <Link
              to="/domains/explore"
              className="inline-block mt-4 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline"
            >
              Explore new domains
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {allDomains.map((cd) => (
              <div
                key={cd.customDomain}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{cd.customDomain}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">Site: {cd.siteDomain}</span>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      cd.verified
                        ? 'bg-green-200 dark:bg-green-900/30 text-green-600 dark:text-green-300'
                        : 'bg-amber-200 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300'
                    }`}
                  >
                    {cd.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!cd.verified && (
                    <button
                      type="button"
                      onClick={() => verifyCustomDomain(cd.siteDomain, cd.customDomain)}
                      disabled={verifyingDomain === cd.customDomain}
                      className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50"
                      title="Verify domain"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteCustomDomain(cd.siteDomain, cd.customDomain)}
                    disabled={deletingDomain === cd.customDomain}
                    className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                    title="Remove domain"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explore Domains Section */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 mt-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Explore Domains</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Search and register new domains</p>

        <Link
          to="/domains/explore"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium cursor-pointer no-underline"
        >
          Explore new domains
        </Link>
      </div>
      <Footer />
    </section>
  );
}

export default Domains;
