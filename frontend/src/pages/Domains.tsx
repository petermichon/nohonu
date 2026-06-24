import { useState, useEffect, useCallback } from 'react';
import { Globe, Check, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/api.ts';
import { useToast } from '../lib/ToastContext.tsx';
import { useAccentColor } from '../lib/AccentColorProvider.tsx';
import { useFont, getFontFamily } from '../lib/FontProvider.tsx';
import { Footer } from '../components/Footer.tsx';

interface CustomDomainEntry {
  siteDomain: string;
  customDomain: string;
  verified: boolean;
}

function Domains() {
  const { apiFetch } = useApi();
  const { showToast } = useToast();
  const { font } = useFont();
  const { getAccentColorValues } = useAccentColor();
  const [allDomains, setAllDomains] = useState<CustomDomainEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);

  const accentColorValues = getAccentColorValues();

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
    <section className="mb-12">
      {/* Dashboard Header */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1"
              style={{ fontFamily: getFontFamily(font) }}
            >
              Domains
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {allDomains.length} {allDomains.length === 1 ? 'domain' : 'domains'} configured
            </p>
          </div>
          <Link
            to="/domains/explore"
            className={`inline-flex items-center gap-2 px-4 h-[40px] rounded-full text-sm font-medium ${
              accentColorValues.textColor === 'light'
                ? 'text-white'
                : accentColorValues.textColor === 'inverted'
                  ? 'text-zinc-100 dark:text-zinc-950'
                  : 'text-zinc-950'
            } cursor-pointer whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
          >
            <Plus className="w-4 h-4" />
            Connect domain
          </Link>
        </div>
      </header>

      {/* Custom Domains Grid */}
      <section className="max-w-7xl mx-auto px-6 py-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 aspect-4/3 animate-pulse" />
            ))}
          </div>
        ) : allDomains.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3
              className="text-xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2"
              style={{ fontFamily: getFontFamily(font) }}
            >
              No custom domains
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
              Connect a custom domain to your site to use your own brand.
            </p>
            <Link
              to="/domains/explore"
              className={`inline-flex items-center gap-2 px-4 h-[40px] rounded-full text-sm font-medium ${
                accentColorValues.textColor === 'light'
                  ? 'text-white'
                  : accentColorValues.textColor === 'inverted'
                    ? 'text-zinc-100 dark:text-zinc-950'
                    : 'text-zinc-950'
              } cursor-pointer whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
            >
              <Plus className="w-4 h-4" />
              Register your first domain
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allDomains.map((cd) => (
              <div
                key={cd.customDomain}
                className="flex flex-col gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-medium text-zinc-950 dark:text-zinc-100 mb-0.5 truncate text-sm"
                        style={{ fontFamily: getFontFamily(font) }}
                      >
                        {cd.customDomain}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{cd.siteDomain}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      cd.verified
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300'
                    }`}
                  >
                    {cd.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  {!cd.verified && (
                    <button
                      type="button"
                      onClick={() => verifyCustomDomain(cd.siteDomain, cd.customDomain)}
                      disabled={verifyingDomain === cd.customDomain}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        accentColorValues.textColor === 'light'
                          ? 'text-white'
                          : accentColorValues.textColor === 'inverted'
                            ? 'text-zinc-100 dark:text-zinc-950'
                            : 'text-zinc-950'
                      } disabled:opacity-50 ${accentColorValues.bg}`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {verifyingDomain === cd.customDomain ? 'Verifying...' : 'Verify'}
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
      </section>
      <Footer />
    </section>
  );
}

export default Domains;
