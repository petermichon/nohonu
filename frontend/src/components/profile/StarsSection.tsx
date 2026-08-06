import { Link } from '@tanstack/react-router';
import { Star as StarIcon } from 'lucide-react';
import { useConnection } from '../../providers/ConnectionProvider.tsx';
import type { Star } from '../../lib/types.ts';

interface StarsSectionProps {
  stars: Star[];
  username: string;
  onToggleStar: (domain: string, isStarred: boolean) => void;
}

export function StarsSection({ stars, username, onToggleStar }: StarsSectionProps) {
  const { username: loggedInUsername } = useConnection();

  if (stars.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <StarIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">No stars yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            @{username} hasn't starred any sites yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {stars.length === 1 ? '1 star' : `${stars.length} stars`}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stars.map((star) => (
          <div
            key={`${star.user}-${star.domain}`}
            className="relative group bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl p-4"
          >
            <Link to="/u/$username/$domain" params={{ username: star.user, domain: star.domain }} className="block">
              <h3 className="font-medium text-zinc-950 dark:text-zinc-100 truncate">
                {star.displayName || star.domain}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-1">
                @{star.user}/{star.domain}
              </p>
            </Link>
            <div className="flex items-center justify-between mt-2">
              {star.starCount != null && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {star.starCount} {star.starCount === 1 ? 'star' : 'stars'}
                </span>
              )}
              {loggedInUsername && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleStar(star.domain, true);
                  }}
                  className="shrink-0 flex items-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full px-2 py-1 cursor-pointer transition-colors"
                >
                  <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
