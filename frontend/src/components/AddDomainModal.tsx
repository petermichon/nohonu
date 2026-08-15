import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from './Modal.tsx';
import { Input } from './Input.tsx';
import { Button } from './Button.tsx';
import type { Site } from '../lib/types.ts';

const VALID_CUSTOM_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;

interface AddDomainModalProps {
  isOpen: boolean;
  sites: Site[];
  onClose: () => void;
  onAdd: (siteId: string, customDomain: string) => Promise<void>;
}

export function AddDomainModal({ isOpen, sites, onClose, onAdd }: AddDomainModalProps) {
  const [customDomain, setCustomDomain] = useState('');
  const [siteId, setSiteId] = useState(sites[0]?.siteId ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = customDomain.trim().toLowerCase();
  const isInvalid = !!trimmed && !VALID_CUSTOM_DOMAIN.test(trimmed);
  const canSubmit = !!trimmed && !!siteId && !isInvalid && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd(siteId, trimmed);
      setCustomDomain('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add custom domain');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add custom domain" size="sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="customDomain" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            Custom domain
          </label>
          <Input
            type="text"
            id="customDomain"
            name="customDomain"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="example.com"
            autoComplete="off"
          />
          {isInvalid && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">Enter a valid domain name</p>
          )}
        </div>

        <div>
          <label htmlFor="siteId" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            Site
          </label>
          <select
            id="siteId"
            name="siteId"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="w-full px-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-full text-sm text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          >
            {sites.length === 0 && <option value="">No sites available</option>}
            {sites.map((site) => (
              <option key={site.siteId} value={site.siteId}>
                {site.displayName || site.siteId}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Adding...
              </span>
            ) : (
              'Add domain'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
