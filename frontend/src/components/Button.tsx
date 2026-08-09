import { forwardRef, type ButtonHTMLAttributes } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function Button(
  { className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`px-4 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 font-medium rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-auto ${className ?? ''}`}
      {...props}
    />
  );
});
