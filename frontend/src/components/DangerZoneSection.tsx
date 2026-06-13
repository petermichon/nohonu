import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Section } from './Section.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';
import type { Site } from '../lib/types.ts';

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

interface DangerZoneSectionProps {
  site: Site | null;
  actionLoading: boolean;
  onRequestDelete: () => void;
}

export function DangerZoneSection({ site, actionLoading, onRequestDelete }: DangerZoneSectionProps) {
  const [allowDeletion, setAllowDeletion] = useState(false);

  return (
    <Section id="actions" icon={SECTION_MAP['actions'].icon} title={SECTION_MAP['actions'].label} danger>
      <div>
        <div className="text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between">
          <span>
            {site?.enabled
              ? 'You must disable the site before deleting it.'
              : 'Enable the toggle to access deletion options.'}
          </span>
          <label htmlFor="allowDeletion" className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-stone-700 dark:text-stone-300">Enable</span>
            <div className="relative">
              <input
                type="checkbox"
                id="allowDeletion"
                checked={allowDeletion}
                onChange={(e) => setAllowDeletion(e.target.checked)}
                disabled={actionLoading || !site}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-red-200 dark:bg-red-900/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-red-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </div>
          </label>
        </div>
      </div>

      <div
        className={`border-t border-stone-200 dark:border-stone-800 pt-4 mt-4 ${!allowDeletion ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-stone-700 dark:text-stone-300">
              Deleting a site is permanent and cannot be undone. All data, including versions and statistics, will
              be permanently removed.
            </p>
            <button
              type="button"
              onClick={onRequestDelete}
              disabled={actionLoading || !site || site.enabled || !allowDeletion}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer disabled:cursor-auto disabled:opacity-50 bg-stone-100 dark:bg-stone-800 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-400 dark:hover:text-white shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Delete Site Permanently
            </button>
          </div>
          {site?.enabled && (
            <p className="text-xs text-stone-700 dark:text-stone-300 mt-2">Site must be disabled first</p>
          )}
        </div>
      </div>
    </Section>
  );
}
