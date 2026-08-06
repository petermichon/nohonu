import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Toast {
  message: string;
  visible: boolean;
  success: boolean;
}

interface ToastContextType {
  toast: Toast;
  showToast: (message: string, success?: boolean) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast>({ message: '', visible: false, success: true });

  const showToast = (message: string, success = true) => {
    setToast({ message, visible: true, success });
  };

  const hideToast = () => {
    setToast({ message: '', visible: false, success: true });
  };

  return <ToastContext.Provider value={{ toast, showToast, hideToast }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
