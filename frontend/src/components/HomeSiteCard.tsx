import { Globe, Eye, Star, ExternalLink } from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useApi, useUser } from '../lib/api.ts';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useToast } from '../lib/ToastContext.tsx';
import { formatHits } from '../lib/utils.ts';
import type { Site } from '../lib/types.ts';

interface HomeSiteCardProps {
  site: Site;
}

export function HomeSiteCard({ site }: HomeSiteCardProps) {
  const { hostWithPort, protocol, apiBase } = useApi();
  const router = useRouter();
  const { user: accountUser } = useUser(site.account);
  const { username: loggedInUsername } = useConnection();
  const { apiFetch } = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const coverUrl = site.coverImage ? `${apiBase}/sites/${site.domain}/cover` : null;

  const getSiteUrl = () => {
    if (!site.enabled) return '';
    const subdomainBase = site.subdomainBase || hostWithPort;
    return site.subdomain
      ? `${protocol}//${site.subdomain}.${subdomainBase}`
      : `${protocol}//${site.domain}.${subdomainBase}`;
  };

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loggedInUsername) return;

    const newStarredState = !site.isStarred;

    try {
      const res = await apiFetch(`/sites/${site.domain}/star`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: newStarredState }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Failed to update star');
        return;
      }
      // Invalidate explore sites query to refresh data
      queryClient.invalidateQueries({ queryKey: ['explore-sites'] });
    } catch {
      showToast('Failed to update star');
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${!site.enabled ? 'opacity-50' : ''}`}>
      {/* Preview area - clickable */}
      <div
        onClick={() => {
          if (site.account) {
            router.navigate({
              to: '/u/$username/$sitename',
              params: { username: site.account, sitename: site.domain },
            });
          }
        }}
        className={`rounded-xl overflow-hidden relative group ${!site.enabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {coverUrl ? (
          <img src={coverUrl} alt={site.domain} className="w-full aspect-4/3 object-cover" />
        ) : (
          <div className="w-full aspect-4/3 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Globe className="w-16 h-16 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-end justify-between p-4">
          <span className="text-zinc-950 dark:text-zinc-100 text-sm font-medium truncate">
            {site.displayName || site.domain}
          </span>
          <div className="flex items-center gap-2">
            {site.enabled && (
              <a
                href={getSiteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 backdrop-blur-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </a>
            )}
            {loggedInUsername && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStar(e);
                }}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 backdrop-blur-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <Star
                  className={`w-4 h-4 ${site.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600 dark:text-zinc-400'}`}
                />
              </button>
            )}
          </div>
        </div>
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{ boxShadow: 'inset 0 -60px 40px -20px rgba(0, 0, 0, 0.3)' }}
        />
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {site.accountProfilePicture ? (
            <img
              src={`${apiBase}/users/${site.account}/profile-picture`}
              alt={site.account}
              className="w-6 h-6 rounded-full object-cover shrink-0 cursor-pointer"
              onClick={() => {
                router.navigate({ to: '/u/$username', params: { username: site.account! } });
              }}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0"
            style={{ display: site.accountProfilePicture ? 'none' : 'flex' }}
          >
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {site.account ? site.account[0].toUpperCase() : 'G'}
            </span>
          </div>
          <div>
            {site.account && (
              <span
                onClick={() => {
                  router.navigate({ to: '/u/$username', params: { username: site.account! } });
                }}
                className="font-semibold text-sm text-zinc-950 dark:text-zinc-100 truncate cursor-pointer block"
              >
                {accountUser?.displayName || site.account}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div
            className={`flex items-center gap-1 ${loggedInUsername ? 'cursor-pointer hover:text-zinc-950 dark:hover:text-zinc-100' : ''}`}
            onClick={handleToggleStar}
          >
            <Star className={`w-4 h-4 ${site.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            {site.starCount ?? 0}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {formatHits(site.hits)}
          </div>
        </div>
      </div>
    </div>
  );
}
