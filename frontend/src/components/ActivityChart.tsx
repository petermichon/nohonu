import { useMemo } from 'react';
import { Eye, RefreshCw, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { relativeTime } from '../lib/utils.ts';
import { SLOT_MS } from '../lib/types.ts';
import { useAccentColor } from '../lib/AccentColorProvider.tsx';
import type { Slot, Visitor, TimeRange } from '../lib/types.ts';

const RANGE_LABELS: Record<TimeRange, string> = {
  1: '1 min',
  30: '30 min',
  60: '1 hour',
  1440: '1 day',
};

interface ActivityChartProps {
  stats: Slot[];
  visitors: Visitor[];
  onReload: () => void;
  reloading: boolean;
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  now: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { count: number; time: string } }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md whitespace-nowrap">
        <p className="flex items-center gap-1 text-xs font-semibold text-zinc-950 dark:text-zinc-100">
          <Eye className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
          {data.count} <span className="font-normal text-zinc-400 dark:text-zinc-500">views</span>
        </p>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{data.time}</p>
      </div>
    );
  }
  return null;
};

export function ActivityChart({ stats, visitors, onReload, reloading, range, onRangeChange, now }: ActivityChartProps) {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const total = stats.reduce((a, b) => a + b.count, 0);
  const sortedVisitors = [...visitors].sort((a, b) => b.last - a.last);

  const chartData = useMemo(() => {
    const BAR_COUNT = 60;
    const groupSize = range;
    const grouped: Map<number, number> = new Map();

    for (const s of stats) {
      const offset = now - s.slot;
      if (offset < 0) continue;
      const barIndex = Math.floor(offset / groupSize);
      if (barIndex >= BAR_COUNT) continue;

      const barSlot = now - barIndex * groupSize;
      grouped.set(barSlot, (grouped.get(barSlot) ?? 0) + s.count);
    }

    const result = [];
    for (let i = BAR_COUNT - 1; i >= 0; i--) {
      const slot = now - i * groupSize;
      const date = new Date(slot * SLOT_MS);
      let timeStr: string;
      if (range >= 1440) {
        timeStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else if (range >= 30) {
        timeStr = date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } else {
        timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      result.push({
        slot,
        count: grouped.get(slot) ?? 0,
        time: timeStr,
        isCurrent: i === 0,
      });
    }

    return result;
  }, [stats, range, now]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Activity</h2>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <Eye className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            {total.toLocaleString()} views
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
            {([1, 30, 60, 1440] as TimeRange[]).map((r) => (
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
      <div className="h-14">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={2}>
            <XAxis dataKey="slot" hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" minPointSize={2}>
              {chartData.map((entry, index) => {
                const count = entry.count;
                const isCurrent = entry.isCurrent;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isCurrent ? accentColorValues.rgb : count === 0 ? '#a1a1aa' : `rgb(${accentColorValues.rgb})`}
                    fillOpacity={isCurrent ? 1 : count === 0 ? 1 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{RANGE_LABELS[range]}/bar</span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">now</span>
      </div>

      <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Visitors</span>
        </div>
        <div className="h-24 overflow-y-auto space-y-1">
          {sortedVisitors.length > 0 ? (
            sortedVisitors.map((v) => (
              <div key={v.ip} className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">{v.ip}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{relativeTime(v.last)}</span>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <Eye className="w-3 h-3" />
                    {v.count}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">No visitors yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
