import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SLOT_MS } from '../lib/types.ts';
import type { UptimeSlot, UptimeRange } from '../lib/types.ts';
import { getAccentStyle, calcUptimePct } from '../lib/utils.ts';

const RANGE_LABELS: Record<UptimeRange, string> = {
  1: '1 min',
  30: '30 min',
  60: '1 hour',
  1440: '1 day',
};

interface UptimeChartProps {
  uptime: UptimeSlot[];
  allUptime: UptimeSlot[];
  range: UptimeRange;
  onRangeChange: (r: UptimeRange) => void;
  onReload: () => void;
  reloading: boolean;
  accent?: string | null;
  now: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { up: boolean | null; time: string } }>;
  accentStyle?: { color?: string } | null;
}

const CustomTooltip = ({ active, payload, accentStyle }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const status = data.up === null ? 'No data' : data.up ? 'Up' : 'Down';
    const statusColor =
      data.up === null
        ? 'text-stone-400 dark:text-stone-500'
        : data.up
          ? accentStyle?.color || 'text-purple-400 dark:text-purple-300'
          : 'text-stone-600 dark:text-stone-400';
    return (
      <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md whitespace-nowrap">
        <p
          className={`text-xs font-semibold ${statusColor}`}
          style={data.up && accentStyle?.color ? { color: accentStyle.color } : undefined}
        >
          {status}
        </p>
        <p className="text-[10px] text-stone-400 dark:text-stone-500">{data.time}</p>
      </div>
    );
  }
  return null;
};

export function UptimeChart({
  uptime,
  allUptime,
  range,
  onRangeChange,
  onReload,
  reloading,
  accent,
  now,
}: UptimeChartProps) {
  const pct = useMemo(() => calcUptimePct(allUptime), [allUptime]);
  const accentStyle = useMemo(() => getAccentStyle(accent, true), [accent]);

  const chartData = useMemo(() => {
    const BAR_COUNT = 60;
    const groupSize = range;
    const grouped: Map<number, boolean | undefined> = new Map();

    for (const s of uptime) {
      const offset = now - s.slot;
      if (offset < 0) continue;
      const barIndex = Math.floor(offset / groupSize);
      if (barIndex >= BAR_COUNT) continue;

      const barSlot = now - barIndex * groupSize;
      const existing = grouped.get(barSlot);
      if (existing === undefined) {
        grouped.set(barSlot, s.up === null ? undefined : s.up);
      } else if (s.up === true) {
        grouped.set(barSlot, true);
      }
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
        up: grouped.get(slot),
        value: 1,
        time: timeStr,
        isCurrent: i === 0,
      });
    }

    return result;
  }, [uptime, range, now]);

  const getBarColor = (up: boolean | undefined, isCurrent: boolean, accent: string | null | undefined) => {
    if (up === undefined) return '#f5f5f4';
    if (up) {
      if (isCurrent) return accent ? accent : '#a855f7';
      return accent ? `${accent}cc` : '#d8b4fe';
    }
    if (isCurrent) return '#78716c';
    return '#d6d3d1';
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">Uptime</h2>
          {pct !== null && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${accentStyle ? '' : 'bg-purple-200 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'}`}
              style={accentStyle ? { backgroundColor: accentStyle.bg, color: accentStyle.color } : undefined}
            >
              {pct}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
            {([1, 30, 60, 1440] as UptimeRange[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => onRangeChange(r)}
                className={`px-2 py-1 text-xs font-medium rounded-md cursor-pointer ${
                  range === r
                    ? 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-sm'
                    : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400'
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
            className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer disabled:cursor-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="h-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={2}>
            <XAxis dataKey="slot" hide />
            <Tooltip content={<CustomTooltip accentStyle={accentStyle} />} cursor={false} />
            <Bar dataKey="value" minPointSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.up, entry.isCurrent, accent)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-400 dark:text-stone-500">{RANGE_LABELS[range]}/bar</span>
        <span className="text-xs text-stone-400 dark:text-stone-500">now</span>
      </div>
    </div>
  );
}
