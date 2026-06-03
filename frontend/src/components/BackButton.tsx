import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BackButtonProps {
  to: string;
  label: string;
  variant?: 'inline' | 'sidebar';
  currentLabel?: string;
  disabled?: boolean;
}

export function BackButton({ to, label, variant = 'inline', currentLabel, disabled = false }: BackButtonProps) {
  const baseClassName =
    variant === 'sidebar'
      ? 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium'
      : 'inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer';

  const displayLabel = variant === 'sidebar' && currentLabel ? currentLabel : label;

  if (disabled) {
    return (
      <div className={baseClassName}>
        <ChevronLeft className="w-4 h-4 shrink-0 text-stone-400 dark:text-stone-600 opacity-50" />
        {variant === 'sidebar' ? (
          <span className="flex-1 text-center text-stone-600 dark:text-stone-400">{displayLabel}</span>
        ) : (
          displayLabel
        )}
        {variant === 'sidebar' && <div className="w-4 h-4 shrink-0" />}
      </div>
    );
  }

  const interactiveClassName =
    variant === 'sidebar'
      ? `${baseClassName} text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100`
      : baseClassName;

  return (
    <Link to={to} className={interactiveClassName}>
      <ChevronLeft className="w-4 h-4 shrink-0" />
      {variant === 'sidebar' ? <span className="flex-1 text-center">{displayLabel}</span> : displayLabel}
      {variant === 'sidebar' && <div className="w-4 h-4 shrink-0" />}
    </Link>
  );
}
