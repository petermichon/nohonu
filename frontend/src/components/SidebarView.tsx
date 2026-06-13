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
  isCollapsed?: boolean;
  breadcrumbs?: ReactNode;
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
  breadcrumbs,
  isCollapsed = false,
}: SidebarViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = contentRef.current;
    if (!ref) return;

    const handleAnimationEnd = () => {
      if (ref) {
        // Add animation-complete class to re-enable hover styles
        ref.classList.add('animation-complete');
      }
    };

    ref.addEventListener('animationend', handleAnimationEnd);

    return () => {
      if (ref) {
        ref.removeEventListener('animationend', handleAnimationEnd);
      }
    };
  }, [animationKey]);

  return (
    <>
      {showBackButton && (
        <>
          <BackButton
            to={backTo}
            label={backLabel}
            variant="sidebar"
            currentLabel={currentLabel}
            disabled={disabled}
            isCollapsed={isCollapsed}
          />
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
        {breadcrumbs}
        {children}
      </div>
    </>
  );
}
