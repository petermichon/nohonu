import { Power, Trash2, Loader2, ArrowUp } from 'lucide-react';
import { Modal } from './Modal.tsx';
import { useState, useEffect, useRef } from 'react';
import { useAccentColor, ACCENT_COLORS } from '../providers/AccentColorProvider.tsx';

type Action = 'delete' | 'enable' | 'disable' | 'delete-version' | 'activate-version';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: Action;
  domain: string;
  loading?: boolean;
}

const CONFIG: Record<
  Action,
  { title: string; message: string; confirm: string; isDanger?: boolean; requiresTimer?: boolean }
> = {
  delete: {
    title: 'Delete site?',
    message: 'This action cannot be undone.',
    confirm: 'Delete',
    isDanger: true,
    requiresTimer: true,
  },
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

const ICON_MAP: Record<Action, React.ComponentType<{ className?: string }>> = {
  delete: Trash2,
  'delete-version': Trash2,
  'activate-version': ArrowUp,
  enable: Power,
  disable: Power,
};

export function ConfirmModal({ isOpen, onClose, onConfirm, action, domain, loading }: ConfirmModalProps) {
  const { getAccentColorValues, accentColor } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const { title, message, confirm, isDanger, requiresTimer } = CONFIG[action];
  const Icon = loading ? Loader2 : ICON_MAP[action];
  const iconClass = isDanger ? accentColorValues.text : 'text-zinc-600 dark:text-zinc-400';
  const btnClass = isDanger
    ? `${accentColorValues.bg}`
    : 'bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600';

  // Determine button text color based on accent color
  const btnTextColor = isDanger
    ? (() => {
        const textColor = ACCENT_COLORS[accentColor]?.textColor;
        if (textColor === 'light') return 'text-white';
        if (textColor === 'dark') return 'text-zinc-950';
        return 'text-white dark:text-zinc-950'; // inverted
      })()
    : 'text-white';

  const [countdown, setCountdown] = useState(3);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (isOpen && requiresTimer) {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        setCountdown(3);
      }
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        clearInterval(timer);
        hasInitializedRef.current = false;
      };
    }
  }, [isOpen, requiresTimer]);

  const isConfirmDisabled = loading || (requiresTimer && countdown > 0);
  const baseBtnClass =
    'flex-1 px-4 py-2 font-medium rounded-lg cursor-pointer disabled:cursor-auto disabled:opacity-50';
  const confirmBtnClass = isDanger ? `${baseBtnClass} ${btnClass} ${btnTextColor}` : `${baseBtnClass} text-white`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
          isDanger ? accentColorValues.bgLight : 'bg-stone-100 dark:bg-stone-800'
        }`}
      >
        <Icon className={`w-5 h-5 ${iconClass} ${loading ? 'animate-spin' : ''}`} />
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{message}</p>
      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-lg mb-6 font-mono">
        {domain}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-stone-300 dark:border-stone-700 text-zinc-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium rounded-lg cursor-pointer disabled:cursor-auto disabled:opacity-50"
        >
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={isConfirmDisabled} className={confirmBtnClass}>
          {requiresTimer && countdown > 0 ? `${confirm} (${countdown})` : confirm}
        </button>
      </div>
    </Modal>
  );
}
