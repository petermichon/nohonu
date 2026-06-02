import { Eye } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface ChartTooltipProps {
  visible: boolean;
  children: React.ReactNode;
}

export function ChartTooltip({ visible, children }: ChartTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 pointer-events-none" />
      <div
        className="fixed z-50 px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md whitespace-nowrap pointer-events-none text-center -translate-x-1/2 -translate-y-full"
        style={{ top: position.top, left: position.left }}
      >
        {children}
      </div>
    </>
  );
}

interface ViewsTooltipProps {
  count: number;
  time: string;
  visible: boolean;
}

export function ViewsTooltip({ count, time, visible }: ViewsTooltipProps) {
  return (
    <ChartTooltip visible={visible}>
      <p className="flex items-center gap-1 text-xs font-semibold text-stone-900 dark:text-stone-100">
        <Eye className="w-3 h-3 text-stone-400 dark:text-stone-500" />
        {count} <span className="font-normal text-stone-400 dark:text-stone-500">views</span>
      </p>
      <p className="text-[10px] text-stone-400 dark:text-stone-500">{time}</p>
    </ChartTooltip>
  );
}

interface UptimeTooltipProps {
  status: 'up' | 'down' | 'nodata';
  time: string;
  visible: boolean;
  accentColor?: string;
}

export function UptimeTooltip({ status, time, visible, accentColor }: UptimeTooltipProps) {
  const getStatusText = () => {
    if (status === 'nodata') return 'No data';
    return status === 'up' ? 'Up' : 'Down';
  };

  const getStatusColor = () => {
    if (status === 'nodata') return 'text-stone-400 dark:text-stone-500';
    if (status === 'up') return accentColor ? '' : 'text-purple-400 dark:text-purple-300';
    return 'text-stone-600 dark:text-stone-400';
  };

  return (
    <ChartTooltip visible={visible}>
      <p
        className={`text-xs font-semibold ${getStatusColor()}`}
        style={status === 'up' && accentColor ? { color: accentColor } : undefined}
      >
        {getStatusText()}
      </p>
      <p className="text-[10px] text-stone-400 dark:text-stone-500">{time}</p>
    </ChartTooltip>
  );
}
