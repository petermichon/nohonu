import { useMemo } from 'react';
import { Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAccentColor } from '../providers/AccentColorProvider.tsx';
import { ChartHeader, formatChartTime, ChartFooter } from './ChartHeader.tsx';
import type { Slot, TimeRange } from '../lib/types.ts';

interface ActivityChartProps {
  stats: Slot[];
  onReload: () => void;
  reloading: boolean;
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  now: number;
}

export function ActivityChart({ stats, onReload, reloading, range, onRangeChange, now }: ActivityChartProps) {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const total = stats.reduce((a, b) => a + b.count, 0);

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
      result.push({
        slot,
        count: grouped.get(slot) ?? 0,
        time: formatChartTime(slot, range),
        isCurrent: i === 0,
      });
    }

    return result;
  }, [stats, range, now]);

  const rgb = accentColorValues.rgb;
  const badge = (
    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300">
      <Eye className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
      {total.toLocaleString()} views
    </span>
  );

  return (
    <div>
      <ChartHeader
        title="Activity"
        range={range}
        onRangeChange={onRangeChange}
        onReload={onReload}
        reloading={reloading}
        badge={badge}
      />
      <div className="h-14">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={2}>
            <XAxis dataKey="slot" hide />
            <Tooltip
              content={({
                active,
                payload,
              }: {
                active?: boolean;
                payload?: Array<{ payload: { count: number; time: string } }>;
              }) =>
                active && payload?.length ? (
                  <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md whitespace-nowrap">
                    <p className="flex items-center gap-1 text-xs font-semibold text-zinc-950 dark:text-zinc-100">
                      <Eye className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                      {payload[0].payload.count}{' '}
                      <span className="font-normal text-zinc-400 dark:text-zinc-500">views</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{payload[0].payload.time}</p>
                  </div>
                ) : null
              }
              cursor={false}
            />
            <Bar dataKey="count" minPointSize={2} radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isCurrent ? `rgb(${rgb})` : entry.count === 0 ? '#a1a1aa' : `rgb(${rgb})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartFooter range={range} />
    </div>
  );
}
