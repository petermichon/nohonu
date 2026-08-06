import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import { useAccentColor } from '../providers/AccentColorProvider.tsx';
import type { Site } from '../lib/types.ts';

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

interface DangerZoneSectionProps {
  site: Site | null;
  actionLoading: boolean;
  onRequestDelete: () => void;
}

export function DangerZoneSection({ site, actionLoading, onRequestDelete }: DangerZoneSectionProps) {
  const [allowDeletion, setAllowDeletion] = useState(false);
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();

  return (
    <div className="border-2 p-4 rounded-xl" style={{ borderColor: `rgb(${accentColorValues.rgb})` }}>
      <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">{SECTION_MAP['actions'].label}</h2>
      <div>
        <div className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
          <span>
            {site?.enabled
              ? 'You must disable the site before deleting it.'
              : 'Enable the toggle to access deletion options.'}
          </span>
          <label htmlFor="allowDeletion" className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Enable</span>
            <div className="relative">
              <input
                type="checkbox"
                id="allowDeletion"
                checked={allowDeletion}
                onChange={(e) => setAllowDeletion(e.target.checked)}
                disabled={actionLoading || !site}
                className="sr-only peer"
              />
              <div
                className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                style={{
                  backgroundColor: `rgba(${accentColorValues.rgb}, 0.25)`,
                  borderColor: `rgb(${accentColorValues.rgb})`,
                }}
              ></div>
            </div>
          </label>
        </div>
      </div>

      <div
        className={`border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4 ${!allowDeletion ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Deleting a site is permanent and cannot be undone. All data, including versions and statistics, will be
              permanently removed.
            </p>
            <button
              type="button"
              onClick={onRequestDelete}
              disabled={actionLoading || !site || site.enabled || !allowDeletion}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer disabled:cursor-auto disabled:opacity-50 bg-zinc-100 dark:bg-zinc-800 shrink-0 hover:brightness-90"
              style={{ color: `rgb(${accentColorValues.rgb})` }}
            >
              <Trash2 className="w-4 h-4" />
              Delete Site Permanently
            </button>
          </div>
          {site?.enabled && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">Site must be disabled first</p>
          )}
        </div>
      </div>
    </div>
  );
}
