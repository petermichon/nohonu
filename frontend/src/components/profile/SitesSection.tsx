import { Link } from '@tanstack/react-router';
import { Plus, Star, User } from 'lucide-react';
import { useAccentColor } from '../../lib/AccentColorProvider.tsx';
import { formatRelativeTime } from '../../lib/utils.ts';
import type { Site } from '../../lib/types.ts';

interface SitesSectionProps {
  sites: Site[];
  username: string;
  isOwnProfile: boolean;
  onToggleStar: (domain: string, isStarred: boolean) => void;
}

function DeployLink({ accentColorValues, label }: { accentColorValues: Record<string, string>; label: string }) {
  return (
    <Link
      to="/deploy"
      className={`inline-flex items-center gap-2 px-4 h-[40px] rounded-full text-sm font-medium ${
        accentColorValues.textColor === 'light'
          ? 'text-white'
          : accentColorValues.textColor === 'inverted'
            ? 'text-zinc-100 dark:text-zinc-950'
            : 'text-zinc-950'
      } cursor-pointer whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
    >
      <Plus className="w-4 h-4" />
      {label}
    </Link>
  );
}

export function SitesSection({ sites, username, isOwnProfile, onToggleStar }: SitesSectionProps) {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();

  if (sites.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">0 sites</p>
          {isOwnProfile && <DeployLink accentColorValues={accentColorValues} label="Deploy site" />}
        </div>
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">No sites yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {isOwnProfile ? 'Deploy your first site to get started.' : `@${username} hasn't published any sites yet.`}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {sites.length === 1 ? '1 site' : `${sites.length} sites`}
        </p>
        {isOwnProfile && <DeployLink accentColorValues={accentColorValues} label="Deploy site" />}
      </div>
      <div className="overflow-hidden">
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {sites.map((site) => (
            <div key={site.siteId} className="flex items-center gap-4 px-6 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <Link
                    to="/u/$username/$sitename"
                    params={{ username: site.account || '', sitename: site.domain }}
                    className="font-medium text-zinc-950 dark:text-zinc-100 truncate hover:underline"
                  >
                    {site.displayName || site.domain}
                  </Link>
                  <span
                    className={`text-[14px] px-2 py-0.5 rounded-full shrink-0 ${
                      !site.enabled
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        : accentColorValues.bgLight + ' ' + accentColorValues.textDark
                    }`}
                  >
                    {site.enabled ? 'Online' : 'Offline'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleStar(site.domain, site.isStarred || false);
                    }}
                    className="shrink-0 flex items-center gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full px-2 py-1.5 cursor-pointer transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        site.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    />
                    {site.starCount !== undefined && (
                      <span className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-none">
                        {site.starCount}
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{site.domain}</p>
                  {site.lastDeployedAt && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatRelativeTime(site.lastDeployedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
