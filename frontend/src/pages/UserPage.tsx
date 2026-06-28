import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, AlertCircle, Layout, Globe, Server, Check, X, Plus, Settings, UserCircle, Key } from 'lucide-react';
import { HomeSiteCard } from '../components/HomeSiteCard.tsx';
import { useSites, useDomains } from '../lib/api.ts';
import { useAccentColor } from '../lib/AccentColorProvider.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useApi } from '../lib/api.ts';
import { useToast } from '../lib/ToastContext.tsx';
import { useState } from 'react';

export default function UserPage() {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const {
    displayName,
    username: loggedInUsername,
    email,
    setDisplayName,
    apiBase,
    apiKey,
    sessionId,
  } = useConnection();
  const { sites, loading, error } = useSites();
  const { domains, loading: domainsLoading } = useDomains();
  const { apiFetch } = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [editingDisplayName, setEditingDisplayName] = useState('');
  const [displayNameStatus, setDisplayNameStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const activeTab = (
    location.pathname.endsWith('/domains')
      ? 'domains'
      : location.pathname.endsWith('/servers')
        ? 'servers'
        : location.pathname.endsWith('/settings')
          ? 'settings'
          : location.pathname.endsWith('/sites')
            ? 'sites'
            : 'overview'
  ) as 'overview' | 'sites' | 'domains' | 'servers' | 'settings';

  const isOwnProfile = username === loggedInUsername;

  // User existence check query
  const userExistsQuery = useQuery({
    queryKey: ['user-exists', username],
    queryFn: async () => {
      if (!username) return false;
      const res = await apiFetch(`/users/${username}`);
      return res.ok;
    },
    retry: false,
  });

  const userExists = userExistsQuery.data ?? null;
  const userLoading = userExistsQuery.isLoading;

  // Verify custom domain mutation
  const verifyDomainMutation = useMutation({
    mutationFn: async ({ siteDomain, customDomain }: { siteDomain: string; customDomain: string }) => {
      const res = await apiFetch(`/sites/${siteDomain}/custom-domains/${customDomain}/verify`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Verification failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
      showToast('Custom domain verified', true);
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  // Delete custom domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: async ({ siteDomain, customDomain }: { siteDomain: string; customDomain: string }) => {
      const res = await apiFetch(`/sites/${siteDomain}/custom-domains/${customDomain}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to remove custom domain');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
      showToast('Custom domain removed', true);
    },
    onError: (err: Error) => {
      showToast(err.message, false);
    },
  });

  const verifyCustomDomain = (siteDomain: string, customDomain: string) => {
    setVerifyingDomain(customDomain);
    verifyDomainMutation.mutate(
      { siteDomain, customDomain },
      {
        onSettled: () => setVerifyingDomain(null),
      }
    );
  };

  const deleteCustomDomain = (siteDomain: string, customDomain: string) => {
    setDeletingDomain(customDomain);
    deleteDomainMutation.mutate(
      { siteDomain, customDomain },
      {
        onSettled: () => setDeletingDomain(null),
      }
    );
  };

  const savePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus('error');
      setTimeout(() => setPasswordStatus('idle'), 2000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setTimeout(() => setPasswordStatus('idle'), 2000);
      return;
    }
    // TODO: Implement backend password change
    setPasswordStatus('saved');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus('idle'), 2000);
  };

  const saveDisplayName = async () => {
    if (!editingDisplayName.trim()) {
      setDisplayNameStatus('error');
      setTimeout(() => setDisplayNameStatus('idle'), 2000);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/auth/displayname`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({ displayName: editingDisplayName }),
      });
      if (res.ok) {
        setDisplayName(editingDisplayName);
        setDisplayNameStatus('saved');
        setTimeout(() => setDisplayNameStatus('idle'), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to update display name');
        setDisplayNameStatus('error');
        setTimeout(() => setDisplayNameStatus('idle'), 2000);
      }
    } catch {
      showToast('Failed to update display name');
      setDisplayNameStatus('error');
      setTimeout(() => setDisplayNameStatus('idle'), 2000);
    }
  };

  const userSites = sites.filter((s) => s.account === username);

  if (!userLoading && userExists === false) {
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
        {/* Header */}
        <header className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-16 h-16 rounded-full ${accentColorValues.bgLight} flex items-center
              justify-center shrink-0`}
            >
              <User className={`w-8 h-8 ${accentColorValues.textDark}`} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-1">{displayName || username}</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">@{username}</p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
            <Link
              to={`/u/${username}`}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <User className="w-4 h-4" />
              Overview
            </Link>
            <Link
              to={`/u/${username}/sites`}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'sites'
                  ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Layout className="w-4 h-4" />
              Sites
            </Link>
            <Link
              to={`/u/${username}/domains`}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'domains'
                  ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Globe className="w-4 h-4" />
              Domains
            </Link>
            <Link
              to={`/u/${username}/servers`}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'servers'
                  ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Server className="w-4 h-4" />
              Servers
            </Link>
            {isOwnProfile && (
              <Link
                to={`/u/${username}/settings`}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'text-zinc-950 dark:text-zinc-50 border-b-2 border-zinc-950 dark:border-zinc-50'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            )}
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

        {/* Overview section */}
        {activeTab === 'overview' && !loading && !error && (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Layout className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-100">Sites</h3>
                </div>
                <p className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">{userSites.length}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-100">Domains</h3>
                </div>
                <p className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">{domains.length}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Server className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-100">Servers</h3>
                </div>
                <p className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">0</p>
              </div>
            </div>
            {userSites.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-4">Recent sites</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userSites.slice(0, 3).map((site) => (
                    <HomeSiteCard key={site.domain} site={site} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Empty state */}
        {!loading && !error && userSites.length === 0 && activeTab === 'sites' && (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">0 sites</p>
              {isOwnProfile && (
                <Link
                  to="/deploy"
                  className={`inline-flex items-center gap-2 px-4 h-[40px] rounded-full text-sm font-medium ${
                    accentColorValues.textColor === 'light'
                      ? 'text-white'
                      : accentColorValues.textColor === 'inverted'
                        ? 'text-zinc-100 dark:text-zinc-950'
                        : 'text-zinc-950'
                  } cursor-pointer whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
                >
                  <Plus className="w-4 h-4" />
                  Deploy site
                </Link>
              )}
            </div>
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">No sites yet</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                {isOwnProfile
                  ? 'Deploy your first site to get started.'
                  : `@${username} hasn't published any sites yet.`}
              </p>
            </div>
          </section>
        )}

        {/* Sites grid */}
        {activeTab === 'sites' && !loading && !error && userSites.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {userSites.length === 1 ? '1 site' : `${userSites.length} sites`}
              </p>
              {isOwnProfile && (
                <Link
                  to="/deploy"
                  className={`inline-flex items-center gap-2 px-4 h-[40px] rounded-full text-sm font-medium ${
                    accentColorValues.textColor === 'light'
                      ? 'text-white'
                      : accentColorValues.textColor === 'inverted'
                        ? 'text-zinc-100 dark:text-zinc-950'
                        : 'text-zinc-950'
                  } cursor-pointer whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
                >
                  <Plus className="w-4 h-4" />
                  Deploy site
                </Link>
              )}
            </div>
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
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {domains.length} {domains.length === 1 ? 'domain' : 'domains'} configured
              </p>
              <Link
                to={`/u/${username}/domains/explore`}
                className={`inline-flex items-center gap-2 px-4 h-[40px] rounded-full text-sm font-medium ${
                  accentColorValues.textColor === 'light'
                    ? 'text-white'
                    : accentColorValues.textColor === 'inverted'
                      ? 'text-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-950'
                } cursor-pointer whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
              >
                <Plus className="w-4 h-4" />
                Connect domain
              </Link>
            </div>
            {domainsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 aspect-4/3 animate-pulse" />
                ))}
              </div>
            ) : domains.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">No custom domains</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                  Connect a custom domain to your site to use your own brand.
                </p>
                <Link
                  to={`/u/${username}/domains/explore`}
                  className={`inline-flex items-center gap-2 px-4 h-[40px] rounded-full text-sm font-medium ${
                    accentColorValues.textColor === 'light'
                      ? 'text-white'
                      : accentColorValues.textColor === 'inverted'
                        ? 'text-zinc-100 dark:text-zinc-950'
                        : 'text-zinc-950'
                  } cursor-pointer whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
                >
                  <Plus className="w-4 h-4" />
                  Register your first domain
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {domains.map((cd) => (
                  <div
                    key={cd.customDomain}
                    className="flex flex-col gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-zinc-950 dark:text-zinc-100 mb-0.5 truncate text-sm">
                            {cd.customDomain}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{cd.siteDomain}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          cd.verified
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300'
                        }`}
                      >
                        {cd.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      {!cd.verified && (
                        <button
                          type="button"
                          onClick={() => verifyCustomDomain(cd.siteDomain, cd.customDomain)}
                          disabled={verifyingDomain === cd.customDomain}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${accentColorValues.textColor === 'light' ? 'text-white' : accentColorValues.textColor === 'inverted' ? 'text-zinc-100 dark:text-zinc-950' : 'text-zinc-950'} disabled:opacity-50 ${accentColorValues.bg}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {verifyingDomain === cd.customDomain ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteCustomDomain(cd.siteDomain, cd.customDomain)}
                        disabled={deletingDomain === cd.customDomain}
                        className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                        title="Remove domain"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Servers section */}
        {activeTab === 'servers' && (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Server className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">No servers</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                @{username} hasn't configured any servers yet.
              </p>
            </div>
          </section>
        )}

        {/* Settings section */}
        {activeTab === 'settings' && isOwnProfile && (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="displayName" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                      Display Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={editingDisplayName || displayName || ''}
                        onChange={(e) => setEditingDisplayName(e.target.value)}
                        placeholder="Enter display name"
                        className="flex-1 px-3 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={saveDisplayName}
                        className="px-4 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 font-medium rounded-lg cursor-pointer"
                      >
                        {displayNameStatus === 'saved' ? 'Saved' : displayNameStatus === 'error' ? 'Error' : 'Save'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">Username</p>
                    <p className="text-sm text-zinc-950 dark:text-zinc-100 font-mono">@{username || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  Account
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">Email</p>
                    <p className="text-sm text-zinc-950 dark:text-zinc-100">{email || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password
                </h2>
                <form
                  className="space-y-4 max-w-md"
                  onSubmit={(e) => {
                    e.preventDefault();
                    savePassword();
                  }}
                >
                  <div>
                    <label htmlFor="username" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      autoComplete="username"
                      value={username || ''}
                      readOnly
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="currentPassword" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                      Confirm New Password
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="flex-1 px-3 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 font-medium rounded-lg cursor-pointer"
                      >
                        {passwordStatus === 'saved' ? 'Saved' : passwordStatus === 'error' ? 'Error' : 'Change'}
                      </button>
                    </div>
                    {passwordStatus === 'error' && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        Passwords do not match or fields are empty
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}
      </section>
    </>
  );
}
