import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
