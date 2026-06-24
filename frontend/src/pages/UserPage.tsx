import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { User, AlertCircle, Layout, Globe, Server } from 'lucide-react';
import { HomeSiteCard } from '../components/HomeSiteCard.tsx';
import { useSites } from '../lib/SitesProvider.tsx';
import { useAccentColor } from '../lib/AccentColorProvider.tsx';
import { useFont, getFontFamily } from '../lib/FontProvider.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { Footer } from '../components/Footer.tsx';

export default function UserPage() {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const { font } = useFont();
  const { username } = useParams<{ username: string }>();
  const { displayName } = useConnection();
  const { sites, loading, error } = useSites();
  const [activeTab, setActiveTab] = useState<'sites' | 'domains' | 'servers'>('sites');

  const userSites = sites.filter((s) => s.account === username);

  return (
    <section className="mb-12">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-16 h-16 rounded-full ${accentColorValues.bgLight} flex items-center justify-center shrink-0`}
          >
            <User className={`w-8 h-8 ${accentColorValues.textDark}`} />
          </div>
          <div>
            <h1
              className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1"
              style={{ fontFamily: getFontFamily(font) }}
            >
              {displayName || username}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">@{username}</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('sites')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'sites'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Layout className="w-4 h-4" />
            Sites
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('domains')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'domains'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            Domains
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('servers')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'servers'
                ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Server className="w-4 h-4" />
            Servers
          </button>
        </nav>
      </header>

      {/* Error state */}
      {error && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div
              className={`w-16 h-16 ${accentColorValues.bgLight} rounded-full flex items-center
                justify-center mx-auto mb-4`}
            >
              <AlertCircle className={`w-8 h-8 ${accentColorValues.textDark}`} />
            </div>
            {error === 'unauthorized' ? (
              <>
                <p className={`${accentColorValues.text} text-base font-medium mb-2`}>Invalid API key</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Update your API key in connection settings</p>
              </>
            ) : (
              <>
                <p className={`${accentColorValues.text} text-base font-medium mb-2`}>Can't connect to server</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Please check if the server is running</p>
              </>
            )}
          </div>
        </section>
      )}

      {/* Loading state */}
      {loading && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden"
              >
                <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && !error && userSites.length === 0 && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3
              className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2"
              style={{ fontFamily: getFontFamily(font) }}
            >
              No sites yet
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
              @{username} hasn't published any sites yet.
            </p>
          </div>
        </section>
      )}

      {/* Sites grid */}
      {activeTab === 'sites' && !loading && !error && userSites.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            {userSites.length === 1 ? '1 site' : `${userSites.length} sites`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSites.map((site) => (
              <HomeSiteCard key={site.domain} site={site} />
            ))}
          </div>
        </section>
      )}

      {/* Domains section */}
      {activeTab === 'domains' && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3
              className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2"
              style={{ fontFamily: getFontFamily(font) }}
            >
              No custom domains
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
              @{username} hasn't configured any custom domains yet.
            </p>
          </div>
        </section>
      )}

      {/* Servers section */}
      {activeTab === 'servers' && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Server className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3
              className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2"
              style={{ fontFamily: getFontFamily(font) }}
            >
              No servers
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
              @{username} hasn't configured any servers yet.
            </p>
          </div>
        </section>
      )}
      <Footer />
    </section>
  );
}
