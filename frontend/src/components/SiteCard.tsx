import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Power, Loader2, Eye, Activity } from 'lucide-react';
import { useApi } from '../lib/api';
import { getAccentStyle, formatHits } from '../lib/utils';
import type { Site } from '../lib/types';

interface SiteCardProps {
  site: Site;
  onToggle?: (d: string) => void;
  loading?: string | null;
  mode?: 'normal' | 'compact';
}

export function SiteCard({ site, onToggle, loading, mode = 'compact' }: SiteCardProps) {
  const { apiBase, host, protocol } = useApi();
  const isLoading = loading === site.domain;
  const siteUrl = `${site.domain}.${host}`;
  const navigate = useNavigate();
  const initial = site.domain[0].toUpperCase();
  const [iconError, setIconError] = useState(false);

  const accentStyle = getAccentStyle(site.accent, site.enabled);
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
    ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
    : 'bg-stone-100 dark:bg-stone-800/60 text-stone-400 dark:text-stone-600';

  const handleCardClick = (e: { target: EventTarget | null }) => {
    if (!(e.target as HTMLElement).closest('button, a')) navigate(`/sites/${site.domain}`);
  };

  const uptimeBarStyle = uptimeBarColor === null && accentStyle ? { backgroundColor: accentStyle.color } : undefined;

  // COMPACT MODE - horizontal row layout
  if (mode === 'compact') {
    return (
      <div
        onClick={handleCardClick}
        className={`group flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${cardClass}`}
      >
        {/* Accent strip */}
        <div
          className={`shrink-0 w-1 self-stretch rounded-full ${uptimeBarColor ?? ''}`}
          style={uptimeBarStyle}
        />

        {/* Favicon */}
        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold select-none overflow-hidden ${iconBgClass}`}>
          {!iconError ? (
            <img
              src={`${apiBase}/sites/${site.domain}/icon`}
              alt=""
              className="w-5 h-5 object-contain"
              onError={() => setIconError(true)}
            />
          ) : initial}
        </div>

        {/* Domain + URL */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm font-semibold truncate ${
              site.enabled ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'
            }`}>
              {site.domain}
            </h3>
            <span
              className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${
                !site.enabled
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-500'
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
            className={`text-xs truncate block transition-colors ${
              site.enabled
                ? 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                : 'text-stone-400/60 dark:text-stone-600 pointer-events-none'
            }`}
          >
            {siteUrl}
          </a>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          {site.hits > 0 && (
            <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
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
          <a
            href={`${protocol}//${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !site.enabled && e.preventDefault()}
            className={`p-1.5 rounded-lg transition-colors ${
              site.enabled
                ? 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                : 'text-stone-300 dark:text-stone-700 pointer-events-none'
            }`}
            title={site.enabled ? 'Open site' : 'Site disabled'}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {isLoading ? (
            <div className="p-1.5">
              <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin" />
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle?.(site.domain); }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                site.enabled
                  ? 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  : 'text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title={site.enabled ? 'Disable site' : 'Enable site'}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // NORMAL MODE - taller card with more content
  return (
    <div
      onClick={handleCardClick}
      className={`group flex flex-col rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden ${cardClass}`}
    >
      {/* Top section */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          {/* Favicon - larger */}
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold select-none overflow-hidden ${iconBgClass}`}>
            {!iconError ? (
              <img
                src={`${apiBase}/sites/${site.domain}/icon`}
                alt=""
                className="w-7 h-7 object-contain"
                onError={() => setIconError(true)}
              />
            ) : initial}
          </div>

          {/* Status pill */}
          <span
            className={`text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide ${
              !site.enabled
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                : accentStyle
                  ? ''
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
            }`}
            style={accentStyle ? { backgroundColor: accentStyle.bg, color: accentStyle.color } : undefined}
          >
            {site.enabled ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* Domain - larger */}
        <h3 className={`text-base font-semibold truncate ${
          site.enabled ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'
        }`}>
          {site.domain}
        </h3>

        {/* URL */}
        <a
          href={`${protocol}//${siteUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => !site.enabled && e.preventDefault()}
          className={`text-sm truncate block mt-1 transition-colors ${
            site.enabled
              ? 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
              : 'text-stone-400/60 dark:text-stone-600 pointer-events-none'
          }`}
        >
          {siteUrl}
        </a>

        {/* Stats row - bigger */}
        <div className="flex items-center gap-4 mt-4">
          {site.hits > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
              <Eye className="w-4 h-4" />
              {formatHits(site.hits)}
              <span className="text-xs text-stone-400 dark:text-stone-500">views</span>
            </span>
          )}
          {site.uptime !== null && (
            <span
              className={`flex items-center gap-1.5 text-sm font-medium ${
                site.uptime < 90
                  ? 'text-red-500 dark:text-red-400'
                  : accentStyle
                    ? ''
                    : 'text-purple-500 dark:text-purple-400'
              }`}
              style={site.uptime >= 90 && accentStyle ? { color: accentStyle.color } : undefined}
            >
              <Activity className="w-4 h-4" />
              {site.uptime}%
              <span className="text-xs text-stone-400 dark:text-stone-500 font-normal">uptime</span>
            </span>
          )}
        </div>

        {/* Uptime progress bar - bigger */}
        <div className="mt-4">
          <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${uptimeBarColor ?? ''}`}
              style={{ width: `${uptimePercent}%`, ...uptimeBarStyle }}
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-auto flex items-center justify-between px-5 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
        <a
          href={`${protocol}//${siteUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => !site.enabled && e.preventDefault()}
          className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
            site.enabled
              ? 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              : 'text-stone-300 dark:text-stone-600 pointer-events-none'
          }`}
        >
          Open site <ExternalLink className="w-4 h-4" />
        </a>

        {isLoading ? (
          <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle?.(site.domain); }}
            className={`text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              site.enabled
                ? 'text-stone-500 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                : 'text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            {site.enabled ? 'Disable' : 'Enable'} <Power className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
