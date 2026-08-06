import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useApi } from '../lib/api.ts';
import { useToast } from '../lib/ToastContext.tsx';
import type { Site } from '../lib/types.ts';

interface UseSiteActionsParams {
  site: Site | null;
  username: string;
  loadSite: () => Promise<void>;
  loadVersions: () => Promise<void>;
}

export function useSiteActions({ site, username, loadSite, loadVersions }: UseSiteActionsParams) {
  const { apiFetch } = useApi();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'enable' | 'disable' | null>(null);
  const [activating, setActivating] = useState<number | null>(null);
  const [deletingVersion, setDeletingVersion] = useState<number | null>(null);
  const [versionModal, setVersionModal] = useState<{
    type: 'delete' | 'activate';
    timestamp: number;
    label: string;
  } | null>(null);

  const deleteSiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await apiFetch(`/sites/${domain}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete site');
      }
      return res.json();
    },
    onSuccess: () => {
      showToast('Site deleted', true);
      navigate({ to: '/u/$username', params: { username } });
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  const toggleSiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await apiFetch(`/sites/${domain}/toggle`, { method: 'PATCH' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle site');
      }
      return res.json();
    },
    onSuccess: async () => {
      await loadSite();
      showToast(`Site ${site?.enabled ? 'disabled' : 'enabled'}`, true);
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  const activateVersionMutation = useMutation({
    mutationFn: async ({ domain, timestamp }: { domain: string; timestamp: number }) => {
      const res = await apiFetch(`/sites/${domain}/versions/${timestamp}/activate`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to activate version');
      }
      return res.json();
    },
    onSuccess: async () => {
      await loadSite();
      await loadVersions();
      showToast('Version activated', true);
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  const deleteVersionMutation = useMutation({
    mutationFn: async ({ domain, timestamp }: { domain: string; timestamp: number }) => {
      const res = await apiFetch(`/sites/${domain}/versions/${timestamp}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete version');
      }
      return res.json();
    },
    onSuccess: async () => {
      await loadVersions();
      showToast('Version deleted', true);
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  const downloadVersionMutation = useMutation({
    mutationFn: async ({ domain, timestamp }: { domain: string; timestamp: number }) => {
      const res = await apiFetch(`/sites/${domain}/versions/${timestamp}/download`);
      if (!res.ok) {
        throw new Error('Download failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${domain}-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: () => {
      showToast('Download failed', false);
    },
  });

  const handleConfirm = async () => {
    if (!confirmAction || !site) return;
    setActionLoading(true);

    if (confirmAction === 'delete') {
      deleteSiteMutation.mutate(site.domain, {
        onSettled: () => {
          setActionLoading(false);
          setConfirmAction(null);
        },
      });
    } else {
      toggleSiteMutation.mutate(site.domain, {
        onSettled: () => {
          setActionLoading(false);
          setConfirmAction(null);
        },
      });
    }
  };

  const handleActivate = async () => {
    if (!site || !versionModal) return;
    const { timestamp } = versionModal;
    setVersionModal(null);
    setActivating(timestamp);
    activateVersionMutation.mutate({ domain: site.domain, timestamp }, { onSettled: () => setActivating(null) });
  };

  const handleDeleteVersion = async () => {
    if (!site || !versionModal) return;
    setDeletingVersion(versionModal.timestamp);
    deleteVersionMutation.mutate(
      { domain: site.domain, timestamp: versionModal.timestamp },
      {
        onSettled: () => {
          setDeletingVersion(null);
          setVersionModal(null);
        },
      }
    );
  };

  const downloadVersion = (timestamp: number) => {
    if (!site) return;
    downloadVersionMutation.mutate({ domain: site.domain, timestamp });
  };

  return {
    actionLoading,
    confirmAction,
    setConfirmAction,
    activating,
    deletingVersion,
    versionModal,
    setVersionModal,
    handleConfirm,
    handleActivate,
    handleDeleteVersion,
    downloadVersion,
  };
}
