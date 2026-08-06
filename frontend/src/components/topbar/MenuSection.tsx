import { Fragment, type ReactNode } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import type { MenuOption } from '../../lib/types.ts';

interface MenuSectionProps {
  onBack: () => void;
  backLabel: string;
  options: MenuOption[];
  currentValue: string;
  onSelect: (value: string) => void;
  children?: ReactNode;
}

export function MenuSection({ onBack, backLabel, options, currentValue, onSelect }: MenuSectionProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        <ChevronLeft className="w-4 h-4" />
        {backLabel}
      </button>
      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
      {options.map(({ value, icon: Icon, label, divider, className, style }) => (
        <Fragment key={value}>
          <button
            type="button"
            onClick={() => onSelect(value)}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            {Icon === null ? (
              <span className="w-4 h-4 shrink-0" />
            ) : typeof Icon === 'string' ? (
              <span className="w-4 h-4 flex items-center justify-center text-xs font-semibold shrink-0">{Icon}</span>
            ) : (
              <Icon className="w-4 h-4 shrink-0" />
            )}
            <span
              className={`${className} flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left`}
              style={style}
            >
              {label}
            </span>
            <Check
              className={`ml-auto w-4 h-4 shrink-0 transition-opacity ${currentValue === value ? 'opacity-100 text-zinc-950 dark:text-zinc-50' : 'opacity-0 text-zinc-950 dark:text-zinc-50'}`}
            />
          </button>
          {divider && <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />}
        </Fragment>
      ))}
    </>
  );
}
