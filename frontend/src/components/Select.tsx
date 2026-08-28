import { forwardRef, type SelectHTMLAttributes } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={`w-full px-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-full text-sm text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 ${className ?? ''}`}
      {...props}
    >
      {children}
    </select>
  );
});