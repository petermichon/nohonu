import { Link, Outlet } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';
import { ConfirmModal } from '../ConfirmModal.tsx';
import { SiteHeader } from './SiteHeader.tsx';
import { SiteShellContext } from './SiteShellContext.ts';
import { useSiteShell } from '../../hooks/useSiteShell.ts';

export function SiteShell() {
  const shell = useSiteShell();

  if (shell.notFound) {
    return (
      <div className="text-center py-24">
        <div className="w-12 h-12 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6 text-purple-500 dark:text-purple-400" />
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Site not found</p>
        <Link
          to="/"
          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 mt-2 inline-block"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <section className="mb-12">
      <SiteHeader
        site={shell.site}
        username={shell.username}
        siteId={shell.siteId}
        activeTab={shell.activeTab}
        isPublicView={shell.isPublicView}
      />

      <SiteShellContext.Provider value={shell}>
        <Outlet />
      </SiteShellContext.Provider>

      <ConfirmModal
        isOpen={!!shell.confirmAction}
        onClose={() => shell.setConfirmAction(null)}
        onConfirm={shell.handleConfirm}
        action={shell.confirmAction ?? 'delete'}
        domain={shell.site?.siteId ?? ''}
        loading={shell.actionLoading}
      />
      <ConfirmModal
        isOpen={shell.versionModal?.type === 'activate'}
        onClose={() => shell.setVersionModal(null)}
        onConfirm={shell.handleActivate}
        action="activate-version"
        domain={shell.versionModal?.label ?? ''}
        loading={!!shell.activating}
      />
      <ConfirmModal
        isOpen={shell.versionModal?.type === 'delete'}
        onClose={() => shell.setVersionModal(null)}
        onConfirm={shell.handleDeleteVersion}
        action="delete-version"
        domain={shell.versionModal?.label ?? ''}
        loading={!!shell.deletingVersion}
      />
    </section>
  );
}
