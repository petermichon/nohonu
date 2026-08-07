import { useParams, useLocation } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';
import { useSites } from '../hooks/api/useSites.ts';
import { useUserSites } from '../hooks/api/useUserSites.ts';
import { useDomains } from '../hooks/api/useDomains.ts';
import { useUser } from '../hooks/api/useUser.ts';
import { useUserStars } from '../hooks/api/useUserStars.ts';
import { useToggleStar } from '../hooks/api/useToggleStar.ts';
import { useAccentColor } from '../providers/AccentColorProvider.tsx';
import { useConnection } from '../providers/ConnectionProvider.tsx';
import { useToast } from '../providers/ToastContext.tsx';
import { UserHeader, type UserPageTab } from '../components/profile/UserHeader.tsx';
import { RecentSitesSection } from '../components/profile/RecentSitesSection.tsx';
import { StarsSection } from '../components/profile/StarsSection.tsx';
import { SitesSection } from '../components/profile/SitesSection.tsx';
import { DomainsSection } from '../components/profile/DomainsSection.tsx';
import { SettingsSection } from '../components/profile/SettingsSection.tsx';

export default function UserPage() {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const { username } = useParams({ from: '/u/$username' });
  const location = useLocation();
  const { displayName, username: loggedInUsername, profilePicture, apiBase } = useConnection();
  const { toggleStar } = useToggleStar();
  const { showToast } = useToast();

  const isOwnProfile = !!loggedInUsername && username === loggedInUsername;
  const { sites: publicSites, loading: publicLoading, error: publicError } = useUserSites(username);
  const { sites: privateSites, loading: privateLoading, error: privateError } = useSites();
  const { domains, loading: domainsLoading } = useDomains();
  const { user: publicUser } = useUser(isOwnProfile ? undefined : username);
  const { stars: userStars, loading: starsLoading } = useUserStars(username);

  const handleToggleStar = async (domain: string, isStarred: boolean) => {
    try {
      await toggleStar(domain, isStarred);
    } catch {
      showToast('Failed to update star');
    }
  };

  const sites = isOwnProfile ? privateSites : publicSites;
  const loading = isOwnProfile ? privateLoading : publicLoading;
  const error = isOwnProfile ? privateError : publicError;

  const activeTab = (
    location.pathname.endsWith('/domains')
      ? 'domains'
      : location.pathname.endsWith('/settings')
        ? 'settings'
        : location.pathname.endsWith('/sites')
          ? 'sites'
          : location.pathname.endsWith('/stars')
            ? 'stars'
            : 'overview'
  ) as UserPageTab;

  const userSites = sites.filter((s) => s.account === username);
  const headerDisplayName = isOwnProfile ? displayName || username : publicUser?.displayName || username;
  const showProfilePicture = isOwnProfile ? !!profilePicture : !!publicUser?.profilePicture;

  if (!isOwnProfile && error === 'not-found') {
    return (
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center py-16">
          <div
            className={`w-16 h-16 ${accentColorValues.bgLight} rounded-full flex items-center
            justify-center mx-auto mb-4`}
          >
            <AlertCircle className={`w-8 h-8 ${accentColorValues.textDark}`} />
          </div>
          <p className={`${accentColorValues.text} text-base font-medium mb-2`}>Account not found</p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">The account @{username} does not exist</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mb-12">
        <UserHeader
          username={username}
          displayName={headerDisplayName}
          isOwnProfile={isOwnProfile}
          showProfilePicture={showProfilePicture}
          apiBase={apiBase}
          activeTab={activeTab}
          siteCount={userSites.length}
          starCount={userStars.length}
          domainCount={domains.length}
          sitesLoading={loading}
          starsLoading={starsLoading}
          domainsLoading={domainsLoading}
        />

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
                  <p className={`${accentColorValues.text} text-base font-medium mb-2`}>Authentication required</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">Please log in to view this page</p>
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

        {loading && activeTab === 'overview' && (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Recent sites</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="rounded-3xl overflow-hidden">
                    <div className="w-full aspect-4/3 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-5 w-14 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'overview' && !loading && !error && (
          <RecentSitesSection sites={userSites} isOwnProfile={isOwnProfile} username={username} />
        )}

        {activeTab === 'stars' && !starsLoading && (
          <StarsSection stars={userStars} username={username} onToggleStar={handleToggleStar} />
        )}

        {activeTab === 'sites' && !loading && !error && (
          <SitesSection
            sites={userSites}
            username={username}
            isOwnProfile={isOwnProfile}
            onToggleStar={handleToggleStar}
          />
        )}

        {activeTab === 'domains' && !domainsLoading && (
          <DomainsSection domains={domains} isOwnProfile={isOwnProfile} domainsLoading={domainsLoading} />
        )}

        {activeTab === 'settings' && isOwnProfile && <SettingsSection username={username} />}
      </section>
    </>
  );
}
