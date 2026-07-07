import { Globe } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAccentColor } from '../lib/AccentColorProvider.tsx';
import type { Site } from '../lib/types.ts';

interface HomeSiteCardProps {
  site: Site;
}

export function HomeSiteCard({ site }: HomeSiteCardProps) {
  const navigate = useNavigate();
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();

  const badgeClass = !site.enabled
    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
    : accentColorValues.bgLight + ' ' + accentColorValues.textDark;

  return (
    <div
      onClick={() => {
        const targetPath = site.account ? `/u/${site.account}/${site.domain}` : `/sites/${site.domain}`;
        navigate({ to: targetPath });
      }}
      className="cursor-pointer flex flex-col gap-4"
    >
      {/* Preview area */}
      <div className={`rounded-3xl overflow-hidden relative group ${!site.enabled ? 'opacity-50' : ''}`}>
        <div className="w-full aspect-4/3 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <Globe className="w-16 h-16 text-zinc-300 dark:text-zinc-600" />
        </div>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
          <span className="text-white text-sm font-medium">View site</span>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {site.account ? site.account[0].toUpperCase() : 'G'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-950 dark:text-zinc-100 mb-0.5 truncate">{site.domain}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">by @{site.account ?? 'Guest'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          <span className={`text-[12px] px-2 py-0.5 rounded-full ${badgeClass}`}>
            {site.enabled ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
