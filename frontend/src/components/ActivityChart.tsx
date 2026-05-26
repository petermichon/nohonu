import { useState } from 'react';
import { Eye, RefreshCw, Globe } from 'lucide-react';
import { relativeTime } from '../lib/utils';
import { SLOT_MS } from '../lib/types';
import type { Slot, Visitor, TimeRange } from '../lib/types';

interface ActivityChartProps {
  stats: Slot[];
  visitors: Visitor[];
  onReload: () => void;
  reloading: boolean;
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
}

export function ActivityChart({ stats, visitors, onReload, reloading, range, onRangeChange }: ActivityChartProps) {
  const [hovered, setHovered] = useState<Slot | null>(null);
  const max = Math.max(...stats.map((s) => s.count), 1);
  const total = stats.reduce((a, b) => a + b.count, 0);
  const now = Math.floor(Date.now() / SLOT_MS);

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">Activity</h2>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-600 dark:text-stone-300">
            <Eye className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
            {total.toLocaleString()} views
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
            {([15, 60] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  range === r
                    ? 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 shadow-sm'
                    : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400'
                }`}
              >
                {r}m
              </button>
            ))}
          </div>
          <button
            onClick={onReload}
            disabled={reloading}
            className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="flex items-end gap-px h-14 relative overflow-visible" onMouseLeave={() => setHovered(null)}>
        {stats.map((s) => {
          const barH = s.count === 0 ? 2 : Math.max(4, Math.round((s.count / max) * 56));
          const isCurrentSlot = s.slot === now;
          const isHovered = hovered?.slot === s.slot;
          return (
            <div
              key={s.slot}
              className="relative flex-1 flex items-end h-full cursor-default"
              onMouseEnter={() => setHovered(s)}
            >
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md whitespace-nowrap pointer-events-none z-10 text-center">
                  <p className="flex items-center gap-1 text-xs font-semibold text-stone-900 dark:text-stone-100"><Eye className="w-3 h-3 text-stone-400 dark:text-stone-500" />{s.count} <span className="font-normal text-stone-400 dark:text-stone-500">views</span></p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500">{new Date(s.slot * SLOT_MS).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              )}
              <div
                style={{ height: barH }}
                className={`w-full rounded-sm transition-colors ${
                  isHovered
                    ? 'bg-stone-500 dark:bg-stone-300'
                    : isCurrentSlot
                    ? 'bg-stone-600 dark:bg-stone-400'
                    : s.count === 0
                    ? 'bg-stone-100 dark:bg-stone-800'
                    : 'bg-stone-300 dark:bg-stone-600'
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-400 dark:text-stone-500">{range}m ago</span>
        <span className="text-xs text-stone-400 dark:text-stone-500">now</span>
      </div>

      {visitors.length > 0 && (
        <div className="mt-4 border-t border-stone-100 dark:border-stone-800 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Visitors</span>
          </div>
          <div className="space-y-1">
            {visitors.map((v) => (
              <div key={v.ip} className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-600 dark:text-stone-300">{v.ip}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">{relativeTime(v.last)}</span>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                    <Eye className="w-3 h-3" />{v.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
