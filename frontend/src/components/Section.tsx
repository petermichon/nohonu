import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
  container?: boolean;
  danger?: boolean;
}

export function Section({ id, icon: Icon, title, children, container = true, danger = false }: SectionProps) {
  const containerClass = danger
    ? 'border border-red-200 dark:border-red-900/50 rounded-lg p-4'
    : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5';

  return (
    <div id={id} className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${danger ? 'text-red-500 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
        <h2
          className={`text-sm font-medium ${danger ? 'text-red-900 dark:text-red-100' : 'text-zinc-700 dark:text-zinc-300'}`}
        >
          {title}
        </h2>
      </div>
      {container ? <div className={containerClass}>{children}</div> : children}
    </div>
  );
}
