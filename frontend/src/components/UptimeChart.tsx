import { useState } from 'react';
import { SLOT_MS } from '../lib/types';
import type { UptimeSlot, UptimeRange } from '../lib/types';
import { getAccentStyle } from '../lib/utils';

interface UptimeChartProps {
  uptime: UptimeSlot[];
  range: UptimeRange;
  onRangeChange: (r: UptimeRange) => void;
  accent?: string | null;
}

export function UptimeChart({ uptime, range, onRangeChange, accent }: UptimeChartProps) {
  const [hovered, setHovered] = useState<UptimeSlot | null>(null);
  const checked = uptime.filter(s => s.up !== null);
  const upCount = checked.filter(s => s.up).length;
  const pct = checked.length === 0 ? null : Math.round((upCount / checked.length) * 100);
  const accentStyle = getAccentStyle(accent, true);

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
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-sm'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400'
              }`}
            >
              {r === 60 ? '1h' : r === 720 ? '12h' : '24h'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-px h-8 relative" onMouseLeave={() => setHovered(null)}>
        {uptime.map((s) => {
          const isHovered = hovered?.slot === s.slot;
          return (
            <div
              key={s.slot}
              className="relative flex-1 flex items-end h-full cursor-default"
              onMouseEnter={() => setHovered(s)}
            >
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md whitespace-nowrap pointer-events-none z-10 text-center">
                  <p className={`text-xs font-semibold ${
                    s.up === null ? 'text-stone-400 dark:text-stone-500' : s.up ? accentStyle ? '' : 'text-purple-400 dark:text-purple-300' : 'text-stone-600 dark:text-stone-400'
                  }`}
                  style={s.up && accentStyle ? { color: accentStyle.color } : undefined}>
                    {s.up === null ? 'No data' : s.up ? 'Up' : 'Down'}
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500">{new Date(s.slot * SLOT_MS).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              )}
              <div
                className={`w-full h-full rounded-sm transition-colors ${
                  s.up === null
                    ? 'bg-stone-100 dark:bg-stone-800'
                    : s.up
                    ? isHovered ? (accent ? '' : 'bg-purple-400 dark:bg-purple-300') : (accent ? '' : 'bg-purple-300 dark:bg-purple-400')
                    : isHovered ? 'bg-stone-400 dark:bg-stone-500' : 'bg-stone-300 dark:bg-stone-600'
                }`}
                style={s.up && accent ? { backgroundColor: isHovered ? accent : `${accent}cc` } : undefined}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-400 dark:text-stone-500">{range >= 1440 ? '24h ago' : range >= 720 ? '12h ago' : '1h ago'}</span>
        <span className="text-xs text-stone-400 dark:text-stone-500">now</span>
      </div>
    </div>
  );
}
