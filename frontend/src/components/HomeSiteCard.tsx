import { Globe } from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import { useApi } from '../lib/api.ts';
import type { Site } from '../lib/types.ts';

interface HomeSiteCardProps {
  site: Site;
}

export function HomeSiteCard({ site }: HomeSiteCardProps) {
  const { hostWithPort, protocol, apiBase } = useApi();
  const router = useRouter();
  const coverUrl = site.coverImage ? `${apiBase}/sites/${site.domain}/cover` : null;

  const getSiteUrl = () => {
    if (!site.enabled) return '';
    const subdomainBase = site.subdomainBase || hostWithPort;
    return site.subdomain
      ? `${protocol}//${site.subdomain}.${subdomainBase}`
      : `${protocol}//${site.domain}.${subdomainBase}`;
  };

  const cardContent = (
    <>
      {/* Preview area */}
      <div className={`rounded-3xl overflow-hidden relative group ${!site.enabled ? 'cursor-not-allowed' : ''}`}>
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
        </div>
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{ boxShadow: 'inset 0 -60px 40px -20px rgba(0, 0, 0, 0.3)' }}
        />
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
            <h3 className="font-semibold text-zinc-950 dark:text-zinc-100 mb-0.5 truncate">
              {site.displayName || site.domain}
            </h3>
            {site.account && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  router.navigate({ to: '/u/$username', params: { username: site.account! } });
                }}
                className="text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-950 dark:hover:text-zinc-100 block"
              >
                by @{site.account}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <a
      href={getSiteUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex flex-col gap-4 ${!site.enabled ? 'opacity-50' : ''}`}
    >
      {cardContent}
    </a>
  );
}
