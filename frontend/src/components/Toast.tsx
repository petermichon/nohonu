import { CheckCircle, XCircle, X } from 'lucide-react';
import { useAccentColor } from '../providers/AccentColorProvider.tsx';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  success?: boolean;
}

export function Toast({ message, visible, onClose, success = true }: ToastProps) {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-stone-100 dark:bg-stone-900 text-zinc-950 dark:text-zinc-100 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
      {success ? (
        <CheckCircle className={`w-5 h-5 ${accentColorValues.text}`} />
      ) : (
        <XCircle className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification" className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
