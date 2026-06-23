import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { useApi } from '../lib/api.ts';
import { useToast } from '../lib/ToastContext.tsx';
import { Section } from './Section.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

interface CustomDomainsSectionProps {
  domain: string;
}

export function CustomDomainsSection({ domain }: CustomDomainsSectionProps) {
  const { apiFetch, host } = useApi();
  const { showToast } = useToast();
  const [customDomains, setCustomDomains] = useState<{ domain: string; verified: boolean }[]>([]);
  const [customDomainsLoading, setCustomDomainsLoading] = useState(false);
  const [newCustomDomain, setNewCustomDomain] = useState('');
  const [addingCustomDomain, setAddingCustomDomain] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [showDnsInstructions, setShowDnsInstructions] = useState(false);

  const loadCustomDomains = useCallback(async () => {
    setCustomDomainsLoading(true);
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains`);
      const data = await res.json();
      setCustomDomains((data.customDomains as { domain: string; verified: boolean }[]) ?? []);
    } catch {
      // non-critical
    } finally {
      setCustomDomainsLoading(false);
    }
  }, [domain, apiFetch]);

  const loadVerificationToken = useCallback(async () => {
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains/token`);
      const data = await res.json();
      setVerificationToken(data.token);
    } catch {
      // non-critical
    }
  }, [domain, apiFetch]);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadCustomDomains();
      loadVerificationToken();
    }
  }, [loadCustomDomains, loadVerificationToken]);

  const addCustomDomain = async () => {
    if (!newCustomDomain.trim()) return;
    setAddingCustomDomain(true);
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain: newCustomDomain.trim() }),
      });
      if (res.ok) {
        await loadCustomDomains();
        setNewCustomDomain('');
        showToast('Custom domain added', true);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to add custom domain', false);
      }
    } catch {
      showToast('Failed to add custom domain', false);
    } finally {
      setAddingCustomDomain(false);
    }
  };

  const verifyCustomDomain = async (customDomain: string) => {
    setVerifyingDomain(customDomain);
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains/${customDomain}/verify`, {
        method: 'POST',
      });
      if (res.ok) {
        await loadCustomDomains();
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

  const deleteCustomDomain = async (customDomain: string) => {
    setDeletingDomain(customDomain);
    try {
      const res = await apiFetch(`/sites/${domain}/custom-domains/${customDomain}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadCustomDomains();
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
    <Section id="custom-domains" icon={SECTION_MAP['custom-domains'].icon} title={SECTION_MAP['custom-domains'].label}>
      <div className="space-y-4">
        {/* DNS Instructions */}
        {verificationToken && (
          <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setShowDnsInstructions(!showDnsInstructions)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">DNS Setup Instructions</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">{showDnsInstructions ? 'Hide' : 'Show'}</span>
            </button>
            {showDnsInstructions && (
              <div className="mt-3 space-y-2 text-xs">
                <div className="p-2 rounded bg-stone-100 dark:bg-stone-800">
                  <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">TXT Record (for verification):</p>
                  <code className="block text-zinc-600 dark:text-zinc-400 break-all">
                    _nohonu.{newCustomDomain || 'example.com'} → {verificationToken}
                  </code>
                </div>
                <div className="p-2 rounded bg-stone-100 dark:bg-stone-800">
                  <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">CNAME Record (or A Record):</p>
                  <code className="block text-zinc-600 dark:text-zinc-400">
                    {newCustomDomain || 'example.com'} → {host}
                  </code>
                  <p className="mt-1 text-zinc-500 dark:text-zinc-500">Or A record to your server IP</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add domain input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCustomDomain}
            onChange={(e) => setNewCustomDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-stone-100 dark:bg-stone-800 text-zinc-950 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={addingCustomDomain}
          />
          <button
            type="button"
            onClick={addCustomDomain}
            disabled={addingCustomDomain || !newCustomDomain.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:cursor-auto disabled:opacity-50 bg-stone-100 dark:bg-stone-800 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-stone-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {/* Custom domains list */}
        {customDomainsLoading ? (
          <div className="space-y-2">
            <div className="h-10 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
            <div className="h-10 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
          </div>
        ) : customDomains.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">No custom domains configured</p>
        ) : (
          <div className="space-y-2">
            {customDomains.map((cd) => (
              <div
                key={cd.domain}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{cd.domain}</span>
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
                      onClick={() => verifyCustomDomain(cd.domain)}
                      disabled={verifyingDomain === cd.domain}
                      className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50"
                      title="Verify domain"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteCustomDomain(cd.domain)}
                    disabled={deletingDomain === cd.domain}
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
    </Section>
  );
}
