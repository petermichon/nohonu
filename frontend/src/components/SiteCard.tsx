import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Power, Loader2, Eye, Activity } from 'lucide-react';
import { useApi } from '../lib/api.ts';
import { getAccentStyle, formatHits } from '../lib/utils.ts';
import { extractAccentColor } from '../lib/extractColor.ts';
import { Tooltip } from './Tooltip.tsx';
import type { Site } from '../lib/types.ts';

interface SiteCardProps {
  site: Site;
  onToggle?: (d: string) => void;
  loading?: string | null;
}

export function SiteCard({ site, onToggle, loading }: SiteCardProps) {
  const { apiBase, host, protocol } = useApi();
  const isLoading = loading === site.domain;
  const siteUrl = `${site.domain}.${host}`;
  const navigate = useNavigate();
  const initial = site.domain[0].toUpperCase();
  const [iconError, setIconError] = useState(false);
  const [extractedAccent, setExtractedAccent] = useState<string | null>(null);

  // Auto-extract accent from icon if not set
  useEffect(() => {
    if (!site.accent && !iconError) {
      const iconUrl = `${apiBase}/sites/${site.domain}/icon`;
      extractAccentColor(iconUrl).then((color) => {
        if (color) setExtractedAccent(color);
      });
    }
  }, [site.accent, site.domain, apiBase, iconError]);

  const accentStyle = getAccentStyle(site.accent || extractedAccent, site.enabled);
  const uptimePercent = site.uptime ?? 0;
  const uptimeBarColor =
    site.uptime === null
      ? 'bg-stone-200 dark:bg-stone-700'
      : site.uptime < 90
        ? 'bg-red-400'
        : accentStyle
          ? null
          : 'bg-purple-400';

  const cardClass = site.enabled
    ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm dark:hover:shadow-stone-900/50'
    : 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800/40';

  const iconBgClass = site.enabled
    ? 'bg-stone-100 dark:bg-stone-800 text-zinc-600 dark:text-zinc-300'
    : 'bg-stone-100 dark:bg-stone-800/60 text-zinc-400 dark:text-zinc-600';

  const handleCardClick = (e: { target: EventTarget | null }) => {
    if (!(e.target as HTMLElement).closest('button, a')) navigate(`/sites/${site.domain}`);
  };

  const uptimeBarStyle = uptimeBarColor === null && accentStyle ? { backgroundColor: accentStyle.color } : undefined;

  return (
    <div
      onClick={handleCardClick}
      className={`group flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer ${cardClass}`}
    >
      {/* Accent strip */}
      <div className={`shrink-0 w-1 self-stretch rounded-full ${uptimeBarColor ?? ''}`} style={uptimeBarStyle} />

      {/* Favicon */}
      {(() => {
        const baseIconClasses =
          'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold select-none overflow-hidden';
        return (
          <div className={`${baseIconClasses} ${iconBgClass}`}>
            {!iconError ? (
              <img
                src={`${apiBase}/sites/${site.domain}/icon`}
                alt=""
                className="w-5 h-5 object-contain"
                onError={() => setIconError(true)}
              />
            ) : (
              initial
            )}
          </div>
        );
      })()}

      {/* Domain + URL */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={`text-sm font-semibold truncate ${
              site.enabled ? 'text-zinc-950 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {site.domain}
          </h3>
          <span
            className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${
              !site.enabled
                ? 'bg-stone-200 dark:bg-stone-800 text-zinc-500'
                : accentStyle
                  ? ''
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
            }`}
            style={accentStyle ? { backgroundColor: accentStyle.bg, color: accentStyle.color } : undefined}
          >
            {site.enabled ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <a
          href={`${protocol}//${siteUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => !site.enabled && e.preventDefault()}
          className={`text-xs truncate block ${
            site.enabled
              ? 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              : 'text-zinc-400/60 dark:text-zinc-600 pointer-events-none'
          }`}
        >
          {siteUrl}
        </a>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        {site.hits > 0 && (
          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Eye className="w-3.5 h-3.5" />
            {formatHits(site.hits)}
          </span>
        )}
        {site.uptime !== null && (
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                site.uptime < 90
                  ? 'text-red-500 dark:text-red-400'
                  : accentStyle
                    ? ''
                    : 'text-purple-500 dark:text-purple-400'
              }`}
              style={site.uptime >= 90 && accentStyle ? { color: accentStyle.color } : undefined}
            >
              <Activity className="w-3.5 h-3.5" />
              {site.uptime}%
            </span>
            <div className="w-16 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${uptimeBarColor ?? ''}`}
                style={{ width: `${uptimePercent}%`, ...uptimeBarStyle }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Tooltip content={site.enabled ? 'Open site' : 'Site disabled'}>
          <a
            href={`${protocol}//${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !site.enabled && e.preventDefault()}
            className={`p-1.5 rounded-lg ${
              site.enabled
                ? 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                : 'text-zinc-300 dark:text-zinc-700'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Tooltip>

        {isLoading ? (
          <div className="p-1.5">
            <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
          </div>
        ) : (
          <Tooltip content={site.enabled ? 'Disable site' : 'Enable site'}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.(site.domain);
              }}
              className={`p-1.5 rounded-lg cursor-pointer ${
                site.enabled
                  ? 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
