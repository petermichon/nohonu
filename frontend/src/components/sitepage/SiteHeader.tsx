import { Link } from '@tanstack/react-router';
import { Layout, BarChart3, Globe, Layers, Settings } from 'lucide-react';
import type { Site, SitePageTab } from '../../lib/types.ts';
import { tabClass } from '../../lib/utils.ts';

interface SiteHeaderProps {
  site: Site | null;
  username: string;
  siteId: string;
  activeTab: SitePageTab;
  isPublicView: boolean;
}

export function SiteHeader({ site, username, siteId, activeTab, isPublicView }: SiteHeaderProps) {
  return (
    <header className="max-w-7xl mx-auto px-6 pt-12 pb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          <Layout className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">{site?.siteId ?? siteId}</h1>
          {username ? (
            <Link
              to="/u/$username"
              params={{ username }}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              @{username}
            </Link>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Your site</p>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 p-1">
        <Link
          to="/u/$username/sites/$siteId"
          params={{ username, siteId }}
          className={tabClass(activeTab === 'overview')}
        >
          <Layout className="w-4 h-4" />
          Overview
        </Link>
        <Link
          to="/u/$username/sites/$siteId/$section"
          params={{ username, siteId, section: 'analytics' }}
          className={tabClass(activeTab === 'analytics')}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </Link>
        <Link
          to="/u/$username/sites/$siteId/$section"
          params={{ username, siteId, section: 'domains' }}
          className={tabClass(activeTab === 'domains')}
        >
          <Globe className="w-4 h-4" />
          Domains
        </Link>
        <Link
          to="/u/$username/sites/$siteId/$section"
          params={{ username, siteId, section: 'versions' }}
          className={tabClass(activeTab === 'versions')}
        >
          <Layers className="w-4 h-4" />
          Versions
        </Link>
        {!isPublicView && (
          <Link
            to="/u/$username/sites/$siteId/$section"
            params={{ username, siteId, section: 'settings' }}
            className={tabClass(activeTab === 'settings')}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        )}
      </nav>
    </header>
  );
}
