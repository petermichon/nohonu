import { useEffect } from 'react';
import { useToast } from '../lib/ToastContext.tsx';
import { Toast } from './Toast.tsx';

export function GlobalToast() {
  const { toast, hideToast } = useToast();

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, hideToast]);

  return <Toast message={toast.message} visible={toast.visible} onClose={hideToast} success={toast.success} />;
}
