import { ExternalLink, Power, Eye } from 'lucide-react';
import { getAccentStyle } from '../lib/utils.ts';
import type { Site } from '../lib/types.ts';

interface OverviewSectionProps {
  site: Site | null;
  siteLoading: boolean;
  actionLoading: boolean;
  accent: string | null;
  iconError: boolean;
  onIconError: () => void;
  onToggle: () => void;
  siteUrl: string;
  host: string;
  apiBase: string;
  totalHits: number;
  uptimePct: number | null;
}

export function OverviewSection({
  site,
  siteLoading,
  actionLoading,
  accent,
  iconError,
  onIconError,
  onToggle,
  siteUrl,
  host,
  apiBase,
  totalHits,
  uptimePct,
}: OverviewSectionProps) {
  return siteLoading ? (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0 mt-0.5">
        <button
          type="button"
          disabled
          className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg opacity-50 cursor-not-allowed"
        >
          <span className="invisible">Enable</span>
        </button>
      </div>
    </div>
  ) : site ? (
    (() => {
      const initial = site.domain[0].toUpperCase();
      const accentStyle = getAccentStyle(accent, site.enabled);
      const baseIconClasses =
        'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-base font-semibold select-none overflow-hidden';
      const enabledIconClasses = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300';
      const disabledIconClasses = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600';
      const iconStateClasses = site.enabled ? enabledIconClasses : disabledIconClasses;
      return (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`${baseIconClasses} ${iconStateClasses}`}>
              {!iconError ? (
                <img
                  src={`${apiBase}/sites/${site.domain}/icon`}
                  alt=""
                  className="w-6 h-6 object-contain"
                  onError={onIconError}
                />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100 truncate">{site.domain}</h1>
                <span
                  className={`shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    !site.enabled
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      : accentStyle
                        ? ''
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300'
                  }`}
                  style={accentStyle ? { backgroundColor: accentStyle.bg, color: accentStyle.color } : undefined}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${!site.enabled ? 'bg-zinc-400 dark:bg-zinc-500' : accentStyle ? '' : 'bg-green-400'}`}
                    style={accentStyle ? { backgroundColor: accentStyle.color } : undefined}
                  />
                  {site.enabled ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => !site.enabled && e.preventDefault()}
                  className={`flex items-center gap-1 text-xs ${
                    site.enabled
                      ? 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      : 'text-zinc-300 dark:text-zinc-600 pointer-events-none'
                  }`}
                >
                  {site.subdomain
                    ? `${site.subdomain}.${site.subdomainBase || host}`
                    : `${site.domain}.${site.subdomainBase || host}`}
                  {site.enabled && <ExternalLink className="w-3 h-3" />}
                </a>
                {totalHits > 0 && (
                  <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                    <Eye className="w-3 h-3" />
                    {totalHits.toLocaleString()} views
                  </span>
                )}
                {uptimePct !== null && (
                  <span
                    className={`text-xs font-medium ${
                      uptimePct < 90
                        ? 'text-zinc-400 dark:text-zinc-500'
                        : accentStyle
                          ? ''
                          : 'text-green-400 dark:text-green-300'
                    }`}
                    style={uptimePct >= 90 && accentStyle ? { color: accentStyle.color } : undefined}
                  >
                    {uptimePct}% uptime
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0 mt-0.5">
            <button
              type="button"
              onClick={onToggle}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer disabled:cursor-auto disabled:opacity-50 w-24 justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              <Power className="w-3.5 h-3.5 shrink-0" />
              <span className="w-14 text-center">{site.enabled ? 'Disable' : 'Enable'}</span>
            </button>
          </div>
        </div>
      );
    })()
  ) : null;
}
