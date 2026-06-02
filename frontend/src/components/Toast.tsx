import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  success?: boolean;
}

export function Toast({ message, visible, onClose, success = true }: ToastProps) {
  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
      {success ? (
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button type="button" onClick={onClose} className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
