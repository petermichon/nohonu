import { User } from 'lucide-react';
import { useApi } from '../lib/api.ts';
import { getAccentStyle } from '../lib/utils.ts';
import type { Site } from '../lib/types.ts';

interface HomeSiteCardProps {
  site: Site;
}

export function HomeSiteCard({ site }: HomeSiteCardProps) {
  const { host, protocol } = useApi();
  const siteUrl = `${site.domain}.${host}`;
  const accentStyle = getAccentStyle(site.accent, site.enabled);

  const badgeClass = !site.enabled
    ? 'bg-stone-200 dark:bg-stone-800 text-stone-500'
    : accentStyle
      ? ''
      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300';

  const badgeStyle = accentStyle ? { backgroundColor: accentStyle.bg, color: accentStyle.color } : undefined;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm dark:hover:shadow-stone-900/50 overflow-hidden">
      {/* Preview area */}
      <a
        href={`${protocol}//${siteUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => !site.enabled && e.preventDefault()}
        className={`block w-full h-32 bg-stone-100 dark:bg-stone-800 rounded-t-xl overflow-hidden ${!site.enabled ? 'opacity-50' : ''}`}
      />

      {/* Card footer */}
      <div className="p-3 space-y-2">
        {/* Row 1: domain + badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate flex-1">
            {site.domain}
          </span>
          <span
            className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${badgeClass}`}
            style={badgeStyle}
          >
            {site.enabled ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* Row 2: account chip */}
        <button
          type="button"
          onClick={() => {}}
          title="User page coming soon"
          className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
        >
          <User className="w-3 h-3" />
          <span>Guest</span>
        </button>
      </div>
    </div>
  );
}
