import type { Site } from '../../lib/types.ts';
import { ProfileSiteCard } from '../ProfileSiteCard.tsx';

interface RecentSitesSectionProps {
  sites: Site[];
  isOwnProfile: boolean;
  username: string;
}

export function RecentSitesSection({ sites, isOwnProfile, username }: RecentSitesSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      {sites.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Recent sites</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.slice(0, 3).map((site) => (
              <ProfileSiteCard key={site.siteId} site={site} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">No sites yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {isOwnProfile ? 'Deploy your first site to get started.' : `@${username} hasn't published any sites yet.`}
          </p>
        </div>
      )}
    </section>
  );
}
