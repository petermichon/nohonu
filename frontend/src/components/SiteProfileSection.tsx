import { useState } from 'react';
import { Layout, User } from 'lucide-react';
import { useUpdateSiteMeta } from '../hooks/api/useUpdateSiteMeta.ts';
import type { Site } from '../lib/types.ts';

interface SiteProfileSectionProps {
  site: Site | null;
  siteLoading: boolean;
}

export function SiteProfileSection({ site, siteLoading }: SiteProfileSectionProps) {
  const { updateSiteMeta } = useUpdateSiteMeta();
  const [editingDisplayName, setEditingDisplayName] = useState(site?.displayName || '');
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
          <div>
            <label htmlFor="siteDisplayName" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="siteDisplayName"
                name="siteDisplayName"
                value={editingDisplayName || site?.displayName || ''}
                onChange={(e) => setEditingDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="flex-1 px-3 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              />
              <button
                type="button"
                onClick={saveDisplayName}
                disabled={isSaving}
                className="px-4 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 font-medium rounded-lg cursor-pointer disabled:opacity-50"
              >
                {isSaving
                  ? 'Saving...'
                  : displayNameStatus === 'saved'
                    ? 'Saved'
                    : displayNameStatus === 'error'
                      ? 'Error'
                      : 'Save'}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="siteUsername" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Owner
            </label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <p className="text-sm text-zinc-950 dark:text-zinc-100 font-mono">@{site?.account || 'Not set'}</p>
            </div>
          </div>
          <div>
            <label htmlFor="siteId" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Site ID
            </label>
            <p className="text-sm text-zinc-950 dark:text-zinc-100 font-mono">{site?.siteId || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
