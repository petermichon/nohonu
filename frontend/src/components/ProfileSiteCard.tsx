import { Globe } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useAccentColor } from '../lib/AccentColorProvider.tsx';
import { useApi } from '../lib/api.ts';
import type { Site } from '../lib/types.ts';

interface ProfileSiteCardProps {
  site: Site;
}

export function ProfileSiteCard({ site }: ProfileSiteCardProps) {
  const { getAccentColorValues } = useAccentColor();
  const { apiBase } = useApi();
  const accentColorValues = getAccentColorValues();
  const coverUrl = site.coverImage ? `${apiBase}/sites/${site.domain}/cover` : null;

  const badgeClass = !site.enabled
    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
    : accentColorValues.bgLight + ' ' + accentColorValues.textDark;

  return (
    <Link
      to="/u/$username/$sitename"
      params={{ username: site.account || '', sitename: site.domain }}
      className="cursor-pointer flex flex-col gap-4"
    >
      {/* Preview area */}
      <div className={`rounded-3xl overflow-hidden relative group ${!site.enabled ? 'opacity-50' : ''}`}>
        {coverUrl ? (
          <img src={coverUrl} alt={site.domain} className="w-full aspect-4/3 object-cover" />
        ) : (
          <div className="w-full aspect-4/3 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Globe className="w-16 h-16 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
          <span className="text-white text-sm font-medium">View site</span>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-950 dark:text-zinc-100 truncate">{site.domain}</h3>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          <span className={`text-[12px] px-2 py-0.5 rounded-full ${badgeClass}`}>
            {site.enabled ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </Link>
  );
}
