import { ArrowRight, Globe } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useApiConfig } from '../hooks/api/useApiConfig.ts';
import type { Site } from '../lib/types.ts';
import { siteUrl } from '../lib/utils.ts';

interface ExploreSiteCardProps {
  site: Site;
}

export function ExploreSiteCard({ site }: ExploreSiteCardProps) {
  const navigate = useNavigate();
  const { hostWithPort, protocol, apiBase } = useApiConfig();
  const coverUrl = site.coverImage ? `${apiBase}/sites/${site.domain}/cover` : null;

  const handlePreviewClick = () => {
    if (site.enabled) {
      window.open(siteUrl(site, protocol, hostWithPort), '_blank');
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetPath = site.account ? `/u/${site.account}/${site.domain}` : `/sites/${site.domain}`;
    navigate({ to: targetPath });
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (site.account) {
      navigate({ to: `/u/${site.account}` });
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${!site.enabled ? 'opacity-50' : ''}`}>
      {/* Preview area */}
      <div
        onClick={handlePreviewClick}
        className={`rounded-3xl overflow-hidden relative group cursor-pointer ${!site.enabled ? 'cursor-not-allowed' : ''}`}
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
            {siteUrl(site, protocol, hostWithPort)}
          </span>
          <button
            onClick={handleTitleClick}
            className="px-4 h-8 rounded-full text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-950 cursor-pointer border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center gap-2"
          >
            View deployment
            <ArrowRight className="w-4 h-4" />
          </button>
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
            <h3
              onClick={handleTitleClick}
              className="font-semibold text-zinc-950 dark:text-zinc-100 mb-0.5 truncate cursor-pointer"
            >
              {site.domain}
            </h3>
            <p
              onClick={handleAuthorClick}
              className={`text-xs text-zinc-500 dark:text-zinc-400 ${site.account ? 'cursor-pointer hover:text-zinc-950 dark:hover:text-zinc-100' : ''}`}
            >
              by @{site.account ?? 'Guest'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
