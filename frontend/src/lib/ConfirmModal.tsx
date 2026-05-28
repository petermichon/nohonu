import { Power, Trash2, Loader2, ArrowUp } from 'lucide-react';
import { Modal } from './Modal.tsx';

type Action = 'delete' | 'enable' | 'disable' | 'delete-version' | 'activate-version';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: Action;
  domain: string;
  loading?: boolean;
}

const CONFIG: Record<Action, { title: string; message: string; confirm: string; isDanger?: boolean }> = {
  delete: { title: 'Delete site?', message: 'This action cannot be undone.', confirm: 'Delete', isDanger: true },
  enable: { title: 'Enable site?', message: 'This will make the site publicly accessible.', confirm: 'Enable' },
  disable: { title: 'Disable site?', message: 'This will make the site inaccessible to visitors.', confirm: 'Disable' },
  'delete-version': {
    title: 'Delete version?',
    message: 'This version will be permanently removed.',
    confirm: 'Delete',
    isDanger: true,
  },
  'activate-version': {
    title: 'Activate version?',
    message: 'This will replace the currently live version.',
    confirm: 'Activate',
  },
};

function getIcon(action: Action, loading: boolean) {
  if (loading) return Loader2;
  if (action === 'delete' || action === 'delete-version') return Trash2;
  if (action === 'activate-version') return ArrowUp;
  return Power;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, action, domain, loading }: ConfirmModalProps) {
  const { title, message, confirm, isDanger } = CONFIG[action];
  const Icon = getIcon(action, loading ?? false);
  const iconClass = isDanger ? 'text-purple-400 dark:text-purple-300' : 'text-stone-600 dark:text-stone-400';
  const btnClass = isDanger
    ? 'bg-purple-400 hover:bg-purple-500'
    : 'bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-purple-200 dark:bg-purple-900/30' : 'bg-stone-100 dark:bg-stone-800'}`}
      >
        <Icon className={`w-5 h-5 ${iconClass} ${loading ? 'animate-spin' : ''}`} />
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">{message}</p>
      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-lg mb-6 font-mono">
        {domain}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 px-4 py-2 ${btnClass} text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50`}
        >
          {confirm}
        </button>
      </div>
    </Modal>
  );
}
