import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { useAddCustomDomain } from '../hooks/api/useAddCustomDomain.ts';
import { useDeleteCustomDomain } from '../hooks/api/useDeleteCustomDomain.ts';
import { useSiteCustomDomains } from '../hooks/api/useSiteCustomDomains.ts';
import { useVerificationToken } from '../hooks/api/useVerificationToken.ts';
import { useVerifyCustomDomain } from '../hooks/api/useVerifyCustomDomain.ts';
import { useToast } from '../providers/ToastContext.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import { host } from '../config.ts';

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

interface CustomDomainsSectionProps {
  username: string;
  siteId: string;
  isReadOnly?: boolean;
}

export function CustomDomainsSection({ username, siteId, isReadOnly = false }: CustomDomainsSectionProps) {
  const { customDomains, loading: customDomainsLoading } = useSiteCustomDomains(username, siteId);
  const { verificationToken } = useVerificationToken(username, siteId);
  const { addCustomDomain } = useAddCustomDomain();
  const { verifyCustomDomain } = useVerifyCustomDomain();
  const { deleteCustomDomain } = useDeleteCustomDomain();
  const { showToast } = useToast();
  const [newCustomDomain, setNewCustomDomain] = useState('');
  const [addingCustomDomain, setAddingCustomDomain] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);
  const [showDnsInstructions, setShowDnsInstructions] = useState(false);

  const handleAddCustomDomain = async () => {
    const value = newCustomDomain.trim();
    if (!value) return;
    setAddingCustomDomain(true);
    try {
      await addCustomDomain(username, siteId, value);
      setNewCustomDomain('');
      showToast('Custom domain added', true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add custom domain', false);
    } finally {
      setAddingCustomDomain(false);
    }
  };

  const handleVerifyCustomDomain = async (customDomain: string) => {
    setVerifyingDomain(customDomain);
    try {
      await verifyCustomDomain(username, siteId, customDomain);
      showToast('Custom domain verified', true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Verification failed', false);
    } finally {
      setVerifyingDomain(null);
    }
  };

  const handleDeleteCustomDomain = async (customDomain: string) => {
    setDeletingDomain(customDomain);
    try {
      await deleteCustomDomain(username, siteId, customDomain);
      showToast('Custom domain removed', true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove custom domain', false);
    } finally {
      setDeletingDomain(null);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">
        {SECTION_MAP['custom-domains'].label}
      </h2>
      <div className="space-y-4">
        {/* Add domain input */}
        <div className="flex gap-2">
          <input
            type="text"
            name="custom-domain"
            value={newCustomDomain}
            onChange={(e) => setNewCustomDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            disabled={addingCustomDomain}
          />
          <button
            type="button"
            onClick={handleAddCustomDomain}
            disabled={addingCustomDomain || !newCustomDomain.trim() || isReadOnly}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:cursor-auto disabled:opacity-50 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {/* Custom domains list */}
        {customDomainsLoading ? (
          <div className="space-y-2">
            <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        ) : customDomains.length === 0 ? (
          <>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">No custom domains configured</p>
            {/* DNS Instructions */}
            {verificationToken && (
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowDnsInstructions(!showDnsInstructions)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">DNS Setup Instructions</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {showDnsInstructions ? 'Hide' : 'Show'}
                  </span>
                </button>
                {showDnsInstructions && (
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-800">
                      <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        TXT Record (for verification):
                      </p>
                      <code className="block text-zinc-600 dark:text-zinc-400 break-all">
                        _nohonu.{newCustomDomain || 'example.com'} → {verificationToken}
                      </code>
                    </div>
                    <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-800">
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
          </>
        ) : (
          <div className="space-y-2">
            {customDomains.map((cd) => (
              <div
                key={cd.domain}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
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
                      onClick={() => handleVerifyCustomDomain(cd.domain)}
                      disabled={verifyingDomain === cd.domain}
                      className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                      title="Verify domain"
                      aria-label="Verify domain"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomDomain(cd.domain)}
                    disabled={deletingDomain === cd.domain}
                    className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                    title="Remove domain"
                    aria-label="Remove domain"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
