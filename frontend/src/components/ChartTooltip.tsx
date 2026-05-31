import { Eye } from 'lucide-react';

interface ChartTooltipProps {
  visible: boolean;
  children: React.ReactNode;
}

export function ChartTooltip({ visible, children }: ChartTooltipProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md whitespace-nowrap pointer-events-none z-10 text-center">
      {children}
    </div>
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
