import { useState, useRef } from 'react';
import { useClickOutside } from '../lib/useClickOutside.ts';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setVisible(false), visible);

  const handleMouseEnter = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - 8;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 8;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 8;
          break;
      }

      setTooltipPos({ top, left });
    }
    setVisible(true);
  };

  const transformClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-y-1/2 -translate-x-full',
    right: '-translate-y-1/2',
  };

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      <div ref={childRef} className="inline-flex">
        {children}
      </div>
      {visible && (
        <div
          className={`fixed z-50 px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md text-stone-900 dark:text-stone-100 text-xs rounded-lg whitespace-nowrap pointer-events-none ${transformClasses[position]}`}
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
