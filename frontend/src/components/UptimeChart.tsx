import { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAccentColor } from '../providers/AccentColorProvider.tsx';
import { ChartHeader, formatChartTime, ChartFooter } from './ChartHeader.tsx';
import type { UptimeSlot, UptimeRange } from '../lib/types.ts';
import { calcUptimePct } from '../lib/utils.ts';

interface UptimeChartProps {
  uptime: UptimeSlot[];
  allUptime: UptimeSlot[];
  range: UptimeRange;
  onRangeChange: (r: UptimeRange) => void;
  onReload: () => void;
  reloading: boolean;
  now: number;
}

export function UptimeChart({ uptime, allUptime, range, onRangeChange, onReload, reloading, now }: UptimeChartProps) {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const pct = useMemo(() => calcUptimePct(allUptime), [allUptime]);

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
      const up = grouped.get(slot);
      result.push({
        slot,
        up,
        value: up === true ? 1 : 0.1,
        time: formatChartTime(slot, range),
        isCurrent: i === 0,
      });
    }

    return result;
  }, [uptime, range, now]);

  const getBarColor = (up: boolean | undefined, isCurrent: boolean) => {
    if (up === undefined) return '#71717a';
    if (up) return `rgb(${accentColorValues.rgb})`;
    if (isCurrent) return '#52525b';
    return '#a1a1aa';
  };

  const badge =
    pct !== null ? (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          pct >= 90
            ? `${accentColorValues.bgLight} ${accentColorValues.text}`
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
        }`}
      >
        {pct}%
      </span>
    ) : undefined;

  return (
    <div>
      <ChartHeader
        title="Uptime"
        range={range}
        onRangeChange={onRangeChange}
        onReload={onReload}
        reloading={reloading}
        badge={badge}
      />
      <div className="h-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={2}>
            <XAxis dataKey="slot" hide />
            <Tooltip
              content={({
                active,
                payload,
              }: {
                active?: boolean;
                payload?: Array<{ payload: { up: boolean | null; time: string } }>;
              }) =>
                active && payload?.length ? (
                  <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md whitespace-nowrap">
                    <p
                      className={`text-xs font-semibold ${
                        payload[0].payload.up === null
                          ? 'text-zinc-400 dark:text-zinc-500'
                          : payload[0].payload.up
                            ? 'text-green-400 dark:text-green-300'
                            : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {payload[0].payload.up === null ? 'No data' : payload[0].payload.up ? 'Up' : 'Down'}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{payload[0].payload.time}</p>
                  </div>
                ) : null
              }
              cursor={false}
            />
            <Bar dataKey="value" minPointSize={2}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.up, entry.isCurrent)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartFooter range={range} />
    </div>
  );
}
