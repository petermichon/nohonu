import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BackButtonProps {
  to: string;
  label: string;
  variant?: 'inline' | 'sidebar';
  currentLabel?: string;
  disabled?: boolean;
  isCollapsed?: boolean;
}

export function BackButton({
  to,
  label,
  variant = 'inline',
  currentLabel,
  disabled = false,
  isCollapsed = false,
}: BackButtonProps) {
  const displayLabel = variant === 'sidebar' && currentLabel ? currentLabel : label;

  if (isCollapsed && variant === 'sidebar') {
    const baseClassName = 'flex flex-col items-center justify-center px-3 py-3 rounded-lg text-sm font-medium gap-1';
    const hoverClasses = 'hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-zinc-950 dark:hover:text-zinc-100';
    const disabledClass = `${baseClassName} text-zinc-400 dark:text-zinc-600 opacity-50`;
    const enabledClass = `${baseClassName} text-zinc-600 dark:text-zinc-400 ${hoverClasses}`;
    const className = disabled ? disabledClass : enabledClass;

    if (disabled) {
      return (
        <div className={className}>
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span className="text-[10px] text-center leading-tight">{displayLabel}</span>
        </div>
      );
    }

    return (
      <Link to={to} className={className}>
        <ChevronLeft className="w-4 h-4 shrink-0" />
        <span className="text-[10px] text-center leading-tight">{displayLabel}</span>
      </Link>
    );
  }

  const baseClassName =
    variant === 'sidebar'
      ? 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium'
      : 'inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer';

  if (disabled) {
    return (
      <div className={baseClassName}>
        <ChevronLeft className="w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-600 opacity-50" />
        {variant === 'sidebar' ? (
          <span className="flex-1 text-center text-zinc-600 dark:text-zinc-400">{displayLabel}</span>
        ) : (
          displayLabel
        )}
        {variant === 'sidebar' && <div className="w-4 h-4 shrink-0" />}
      </div>
    );
  }

  const sidebarHover = 'hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-zinc-950 dark:hover:text-zinc-100';
  const interactiveClassName =
    variant === 'sidebar' ? `${baseClassName} text-zinc-600 dark:text-zinc-400 ${sidebarHover}` : baseClassName;

  return (
    <Link to={to} className={interactiveClassName}>
      <ChevronLeft className="w-4 h-4 shrink-0" />
      {variant === 'sidebar' ? <span className="flex-1 text-center">{displayLabel}</span> : displayLabel}
      {variant === 'sidebar' && <div className="w-4 h-4 shrink-0" />}
    </Link>
  );
}
