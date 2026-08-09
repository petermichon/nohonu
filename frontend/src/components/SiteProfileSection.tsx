import { useState } from 'react';
import { Layout, User } from 'lucide-react';
import { useUpdateSiteMeta } from '../hooks/api/useUpdateSiteMeta.ts';
import type { Site } from '../lib/types.ts';
import { SaveField } from './SaveField.tsx';
import { Field } from './Field.tsx';

interface SiteProfileSectionProps {
  site: Site | null;
  siteLoading: boolean;
}

export function SiteProfileSection({ site, siteLoading }: SiteProfileSectionProps) {
  const { updateSiteMeta } = useUpdateSiteMeta();
  const [editingDisplayName, setEditingDisplayName] = useState<string | null>(null);
  const [displayNameStatus, setDisplayNameStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  const saveDisplayName = async () => {
    if (!site || !editingDisplayName.trim()) {
      setDisplayNameStatus('error');
      setTimeout(() => setDisplayNameStatus('idle'), 2000);
      return;
    }
    setIsSaving(true);
    try {
      await updateSiteMeta(site.domain, editingDisplayName.trim());
      setEditingDisplayName(editingDisplayName.trim());
      setDisplayNameStatus('saved');
      setTimeout(() => setDisplayNameStatus('idle'), 2000);
    } catch {
      setDisplayNameStatus('error');
      setTimeout(() => setDisplayNameStatus('idle'), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  if (siteLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Profile
          </h2>
          <div className="space-y-4 max-w-md">
            <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Layout className="w-5 h-5" />
          Profile
        </h2>
        <div className="space-y-4 max-w-md">
          <SaveField
            label="Display Name"
            htmlFor="siteDisplayName"
            value={editingDisplayName ?? site?.displayName ?? ''}
            onChange={(value) => setEditingDisplayName(value)}
            placeholder="Enter display name"
            onSave={saveDisplayName}
            saveDisabled={isSaving}
            buttonContent={
              isSaving
                ? 'Saving...'
                : displayNameStatus === 'saved'
                  ? 'Saved'
                  : displayNameStatus === 'error'
                    ? 'Error'
                    : 'Save'
            }
          />
          <Field label="Owner" htmlFor="siteUsername">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <p className="text-sm text-zinc-950 dark:text-zinc-100 font-mono">@{site?.account || 'Not set'}</p>
            </div>
          </Field>
          <Field label="Site ID" htmlFor="siteId">
            <p className="text-sm text-zinc-950 dark:text-zinc-100 font-mono">{site?.siteId || 'Not set'}</p>
          </Field>
        </div>
      </div>
    </div>
  );
}
