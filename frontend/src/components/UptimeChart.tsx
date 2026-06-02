import { useState, useMemo } from 'react';
import { SLOT_MS } from '../lib/types.ts';
import type { UptimeSlot, UptimeRange } from '../lib/types.ts';
import { getAccentStyle, calcUptimePct } from '../lib/utils.ts';
import { UptimeTooltip } from './ChartTooltip.tsx';

const RANGE_LABELS: Record<UptimeRange, string> = {
  60: '1h',
  720: '12h',
  1440: '24h',
};

const TIME_LABELS: Record<UptimeRange, string> = {
  60: '1h ago',
  720: '12h ago',
  1440: '24h ago',
};

interface UptimeChartProps {
  uptime: UptimeSlot[];
  range: UptimeRange;
  onRangeChange: (r: UptimeRange) => void;
  accent?: string | null;
}

function getBarClassName(up: boolean | null, isHovered: boolean, hasAccent: boolean): string {
  if (up === null) return 'bg-stone-100 dark:bg-stone-800';
  if (up) {
    if (isHovered) return hasAccent ? '' : 'bg-purple-400 dark:bg-purple-300';
    return hasAccent ? '' : 'bg-purple-300 dark:bg-purple-400';
  }
  return isHovered ? 'bg-stone-400 dark:bg-stone-500' : 'bg-stone-300 dark:bg-stone-600';
}

function getBarStyle(
  up: boolean | null,
  isHovered: boolean,
  accent: string | null | undefined
): React.CSSProperties | undefined {
  if (up && accent) {
    return { backgroundColor: isHovered ? accent : `${accent}cc` };
  }
  return undefined;
}

export function UptimeChart({ uptime, range, onRangeChange, accent }: UptimeChartProps) {
  const [hovered, setHovered] = useState<UptimeSlot | null>(null);
  const pct = useMemo(() => calcUptimePct(uptime), [uptime]);
  const accentStyle = useMemo(() => getAccentStyle(accent, true), [accent]);

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
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
          {([60, 720, 1440] as UptimeRange[]).map((r) => (
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
      </div>
      <div
        className="flex items-end gap-0.5 h-8 relative overflow-x-scroll overflow-y-visible chart-scrollbar"
        style={{
          scrollbarColor: 'rgb(214 211 209) transparent',
          scrollbarWidth: 'thin',
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <style>{`
          .chart-scrollbar::-webkit-scrollbar {
            height: 8px;
          }
          .chart-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .chart-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgb(214 211 209);
            border-radius: 4px;
          }
          .chart-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgb(168 162 158);
          }
        `}</style>
        {uptime.map((s) => {
          const isHovered = hovered?.slot === s.slot;
          return (
            <div
              key={s.slot}
              className="relative shrink-0 flex items-end h-full cursor-default"
              style={{ width: '10px' }}
              onMouseEnter={() => setHovered(s)}
            >
              <UptimeTooltip
                status={s.up === null ? 'nodata' : s.up ? 'up' : 'down'}
                time={new Date(s.slot * SLOT_MS).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                visible={isHovered}
                accentColor={accentStyle?.color}
              />
              <div
                className={`w-full h-full rounded-sm ${getBarClassName(s.up, isHovered, !!accent)}`}
                style={getBarStyle(s.up, isHovered, accent)}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-400 dark:text-stone-500">{TIME_LABELS[range]}</span>
        <span className="text-xs text-stone-400 dark:text-stone-500">now</span>
      </div>
    </div>
  );
}
