import { type ReactNode, useEffect, useRef } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const handleAnimationEnd = () => {
      if (contentRef.current) {
        // Add animation-complete class to re-enable hover styles
        contentRef.current.classList.add('animation-complete');
      }
    };

    contentRef.current.addEventListener('animationend', handleAnimationEnd);

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('animationend', handleAnimationEnd);
      }
    };
  }, [animationKey]);

  return (
    <>
      {showBackButton && (
        <>
          <BackButton to={backTo} label={backLabel} variant="sidebar" currentLabel={currentLabel} disabled={disabled} />
          <div className="my-2 border-t border-transparent" />
        </>
      )}

      <div
        key={animationKey}
        ref={contentRef}
        className={`flex flex-col gap-0.5 mt-0.5 ${
          animationDirection === 'right' ? 'sidebar-animate-right' : 'sidebar-animate-left'
        }`}
      >
        {children}
      </div>
    </>
  );
}
