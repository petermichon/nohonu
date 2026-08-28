import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from './Modal.tsx';
import { Field } from './Field.tsx';
import { Input } from './Input.tsx';
import { Select } from './Select.tsx';
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
        <Field label="Custom domain" htmlFor="customDomain">
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
        </Field>

        <Field label="Site" htmlFor="siteId">
          <Select
            id="siteId"
            name="siteId"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
          >
            {sites.length === 0 && <option value="">No sites available</option>}
            {sites.map((site) => (
              <option key={site.siteId} value={site.siteId}>
                {site.displayName || site.siteId}
              </option>
            ))}
          </Select>
        </Field>

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
