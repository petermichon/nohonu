import { type ReactNode } from 'react';

interface NavItemsProps {
  children: ReactNode;
}

export function NavItems({ children }: NavItemsProps) {
  return <div className="flex flex-col gap-0.5">{children}</div>;
}
