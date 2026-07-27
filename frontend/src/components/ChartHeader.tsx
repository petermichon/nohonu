import { RefreshCw } from 'lucide-react';

const RANGES = [1, 30, 60, 1440] as const;
const RANGE_LABELS: Record<number, string> = { 1: '1 min', 30: '30 min', 60: '1 hour', 1440: '1 day' };

export function ChartHeader({
  title,
  range,
  onRangeChange,
  onReload,
  reloading,
  badge,
}: {
  title: string;
  range: number;
  onRangeChange: (r: number) => void;
  onReload: () => void;
  reloading: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</h2>
        {badge}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
          {RANGES.map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-2 py-1 text-xs font-medium rounded-md cursor-pointer ${
                range === r
                  ? 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onReload}
          disabled={reloading}
          className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer disabled:cursor-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}

export function formatChartTime(slot: number, range: number): string {
  const date = new Date(slot * 60000);
  if (range >= 1440) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  if (range >= 30) {
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChartFooter({ range }: { range: number }) {
  return (
    <div className="flex justify-between mt-2">
      <span className="text-xs text-zinc-400 dark:text-zinc-500">{RANGE_LABELS[range]}/bar</span>
      <span className="text-xs text-zinc-400 dark:text-zinc-500">now</span>
    </div>
  );
}
