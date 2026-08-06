import { Link } from '@tanstack/react-router';
import { User, Layout, Star, Globe, Settings } from 'lucide-react';
import { useAccentColor } from '../../providers/AccentColorProvider.tsx';

export type UserPageTab = 'overview' | 'sites' | 'domains' | 'settings' | 'stars';

interface UserHeaderProps {
  username: string;
  displayName: string;
  isOwnProfile: boolean;
  showProfilePicture: boolean;
  apiBase: string;
  activeTab: UserPageTab;
  siteCount: number;
  starCount: number;
  domainCount: number;
  sitesLoading: boolean;
  starsLoading: boolean;
  domainsLoading: boolean;
}

export function UserHeader({
  username,
  displayName,
  isOwnProfile,
  showProfilePicture,
  apiBase,
  activeTab,
  siteCount,
  starCount,
  domainCount,
  sitesLoading,
  starsLoading,
  domainsLoading,
}: UserHeaderProps) {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded-full ${
      active
        ? 'text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800'
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
    }`;

  const avatarClass = `w-16 h-16 rounded-full ${accentColorValues.bgLight} flex items-center justify-center shrink-0`;

  return (
    <header className="max-w-7xl mx-auto px-6 pt-12 pb-8">
      <div className="flex items-center gap-4 mb-4">
        {showProfilePicture ? (
          <img
            src={`${apiBase}/users/${username}/profile-picture`}
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className={avatarClass}>
            <User className={`w-8 h-8 ${accentColorValues.textDark}`} />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">{displayName}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">@{username}</p>
        </div>
      </div>

      <nav className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 p-1">
        <Link to="/u/$username" params={{ username }} className={tabClass(activeTab === 'overview')}>
          <User className="w-4 h-4" />
          Overview
        </Link>
        <Link to="/u/$username/sites" params={{ username }} className={tabClass(activeTab === 'sites')}>
          <Layout className="w-4 h-4" />
          Sites
          <span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal tabular-nums">
            <span className={sitesLoading ? 'invisible' : ''}>{siteCount}</span>
          </span>
        </Link>
        <Link to="/u/$username/stars" params={{ username }} className={tabClass(activeTab === 'stars')}>
          <Star className="w-4 h-4" />
          Stars
          <span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal tabular-nums">
            <span className={starsLoading ? 'invisible' : ''}>{starCount}</span>
          </span>
        </Link>
        <Link to="/u/$username/domains" params={{ username }} className={tabClass(activeTab === 'domains')}>
          <Globe className="w-4 h-4" />
          Domains
          <span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal tabular-nums">
            <span className={domainsLoading ? 'invisible' : ''}>{domainCount}</span>
          </span>
        </Link>
        {isOwnProfile && (
          <Link to="/u/$username/settings" params={{ username }} className={tabClass(activeTab === 'settings')}>
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        )}
      </nav>
    </header>
  );
}
