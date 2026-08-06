import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../hooks/api.ts';
import { useToast } from '../providers/ToastContext.tsx';

interface SubdomainSectionProps {
  subdomain: string | null;
  siteLoading: boolean;
  isReadOnly?: boolean;
}

export function SubdomainSection({ subdomain, siteLoading, isReadOnly = false }: SubdomainSectionProps) {
  const { apiFetch } = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editingSubdomain, setEditingSubdomain] = useState(subdomain || '');
  const [isSaving, setIsSaving] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (newSubdomain: string) => {
      const res = await apiFetch(`/sites/meta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: newSubdomain || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update subdomain');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-meta'] });
      showToast('Subdomain updated', true);
      setIsSaving(false);
    },
    onError: (err: Error) => {
      showToast(err.message, false);
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    if (editingSubdomain === subdomain) {
      return;
    }
    setIsSaving(true);
    updateMutation.mutate(editingSubdomain);
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">Subdomain</h2>
      <div className="flex items-center gap-2">
        {siteLoading ? (
          <div className="h-10 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        ) : isReadOnly ? (
          <div className="flex-1 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-950 dark:text-zinc-100">
            {subdomain || 'Default (username-deployment)'}
          </div>
        ) : (
          <>
            <input
              type="text"
              name="subdomain"
              value={editingSubdomain}
              onChange={(e) => setEditingSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="subdomain"
              className="flex-1 px-3 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || editingSubdomain === subdomain}
              className="px-4 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 font-medium rounded-lg cursor-pointer disabled:cursor-auto disabled:opacity-40"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        Leave empty to use default subdomain (username-deployment)
      </p>
    </div>
  );
}
