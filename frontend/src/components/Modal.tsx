import { useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside.ts';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useClickOutside(contentRef, onClose, isOpen);

  if (!isOpen) return null;

  const widthClass = size === 'sm' ? 'max-w-sm' : 'max-w-md';
  const baseModalClasses =
    'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 w-full';
  const modalClasses = `${baseModalClasses} ${widthClass}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div ref={contentRef} className={modalClasses}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
