import { type ReactNode } from 'react';
import { BackButton } from './BackButton.tsx';

interface SidebarViewProps {
  children: ReactNode;
  backTo: string;
  backLabel: string;
  currentLabel: string;
  showBackButton?: boolean;
  disabled?: boolean;
  animationKey: number;
  animationDirection: 'left' | 'right';
}

export function SidebarView({
  children,
  backTo,
  backLabel,
  currentLabel,
  showBackButton = true,
  disabled = false,
  animationKey,
  animationDirection,
}: SidebarViewProps) {
  return (
    <>
      {showBackButton && (
        <BackButton to={backTo} label={backLabel} variant="sidebar" currentLabel={currentLabel} disabled={disabled} />
      )}

      <div
        key={animationKey}
        className={`flex flex-col gap-0.5 mt-0.5 ${
          animationDirection === 'right' ? 'sidebar-animate-right' : 'sidebar-animate-left'
        }`}
      >
        {children}
      </div>
    </>
  );
}
