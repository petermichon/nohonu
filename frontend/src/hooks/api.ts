import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useConnection } from '../providers/ConnectionProvider.tsx';
import { parseApiBase } from '../lib/utils.ts';
import type { Site, Domain, Session } from '../lib/types.ts';

export function useApi() {
  const { apiBase, apiKey, sessionId, username } = useConnection();
  const { host, hostWithPort, protocol } = parseApiBase(apiBase);
  const apiFetch = useCallback(
    (path: string, init?: RequestInit) => {
      const headers: HeadersInit = {
        ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
        ...(sessionId ? { 'X-Session-Id': sessionId } : {}),
        ...(username ? { 'X-Username': username } : {}),
      };
      return fetch(`${apiBase}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
    },
    [apiBase, apiKey, sessionId, username]
  );
  return { apiBase, apiKey, sessionId, username, host, hostWithPort, protocol, apiFetch };
}

export function useSites() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const res = await apiFetch('/sites');
      if (res.status === 401) {
        throw new Error('unauthorized');
      }
      const data = await res.json();
      return (data.sites ?? []) as Site[];
    },
    retry: false,
  });

  const refreshSites = () => queryClient.invalidateQueries({ queryKey: ['sites'] });

  return {
    sites: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error.message === 'unauthorized' ? 'unauthorized' : 'connection') : false,
    refreshSites,
  };
}

export function useExploreSites() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['explore-sites'],
    queryFn: async () => {
      const res = await apiFetch('/explore/sites');
      if (!res.ok) {
        throw new Error('connection');
      }
      const data = await res.json();
      return (data.sites ?? []) as Site[];
    },
    retry: false,
  });

  const refreshExploreSites = () => queryClient.invalidateQueries({ queryKey: ['explore-sites'] });

  return {
    sites: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? 'connection' : false,
    refreshExploreSites,
  };
}

export function useUserSites(username: string | undefined) {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-sites', username],
    queryFn: async () => {
      if (!username) return [];
      const res = await apiFetch(`/users/${username}/sites`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('not-found');
        }
        throw new Error('connection');
      }
      const data = await res.json();
      return (data.sites ?? []) as Site[];
    },
  });

  return {
    sites: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? 'connection' : false,
    refreshUserSites: () => queryClient.invalidateQueries({ queryKey: ['user-sites', username] }),
  };
}

export function useUserStars(username: string | undefined) {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-stars', username],
    queryFn: async () => {
      if (!username) return [];
      const res = await apiFetch(`/users/${username}/stars`);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error('connection');
      }
      const data = await res.json();
      return data.sites ?? [];
    },
  });

  return {
    stars: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? 'connection' : false,
    refreshStars: () => queryClient.invalidateQueries({ queryKey: ['user-stars', username] }),
  };
}

export function useUser(username: string | undefined) {
  const { apiFetch } = useApi();

  const query = useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      if (!username) return null;
      const res = await apiFetch(`/users/${username}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('not-found');
        }
        throw new Error('connection');
      }
      const data = await res.json();
      return data.user as { username: string; displayName: string; profilePicture?: string } | null;
    },
  });

  return {
    user: query.data,
    loading: query.isLoading,
    error: query.error ? 'connection' : false,
  };
}

export function useDomains() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['custom-domains'],
    queryFn: async () => {
      const res = await apiFetch('/custom-domains');
      const data = await res.json();
      return (data.customDomains ?? []) as Domain[];
    },
    retry: false,
  });

  const refreshDomains = () => queryClient.invalidateQueries({ queryKey: ['custom-domains'] });

  return {
    domains: query.data ?? [],
    loading: query.isLoading,
    refreshDomains,
  };
}

export function useSessions() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await apiFetch('/auth/sessions');
      if (!res.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await res.json();
      return (data.sessions ?? []) as Session[];
    },
    retry: false,
  });

  const refreshSessions = () => queryClient.invalidateQueries({ queryKey: ['sessions'] });

  return {
    sessions: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? 'Failed to fetch sessions' : false,
    refreshSessions,
  };
}

export function useDeleteSession() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const deleteSession = async (sessionId: string) => {
    const res = await apiFetch(`/auth/sessions/delete?id=${sessionId}`, { method: 'DELETE' });
    if (!res.ok) {
      throw new Error('Failed to delete session');
    }
    await queryClient.invalidateQueries({ queryKey: ['sessions'] });
  };

  return { deleteSession };
}

export function useLogout() {
  const { apiFetch } = useApi();

  const logout = async () => {
    const res = await apiFetch('/auth/logout', { method: 'POST' });
    if (!res.ok) {
      throw new Error('Failed to logout');
    }
  };

  return { logout };
}

export function useServers() {
  // TODO: Implement servers API when backend is ready
  return {
    servers: [],
    loading: false,
    error: false,
  };
}

export function useSiteCustomDomains(domain: string) {
  const { apiFetch } = useApi();

  const query = useQuery({
    queryKey: ['custom-domains', domain],
    queryFn: async () => {
      const res = await apiFetch(`/sites/${domain}/custom-domains`);
      const data = await res.json();
      return (data.customDomains as Domain[]) ?? [];
    },
    retry: false,
  });

  return {
    customDomains: query.data ?? [],
    loading: query.isLoading,
  };
}

export function useVerificationToken(domain: string) {
  const { apiFetch } = useApi();

  const query = useQuery({
    queryKey: ['verification-token', domain],
    queryFn: async () => {
      const res = await apiFetch(`/sites/${domain}/custom-domains/token`);
      const data = await res.json();
      return data.token as string;
    },
    retry: false,
  });

  return {
    verificationToken: query.data ?? null,
  };
}

export function useToggleStar() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const toggleStar = async (domain: string, isStarred: boolean) => {
    const res = await apiFetch(`/sites/${domain}/star`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred: isStarred }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update star');
    }
    queryClient.invalidateQueries({ queryKey: ['explore-sites'] });
    queryClient.invalidateQueries({ queryKey: ['sites'] });
    queryClient.invalidateQueries({ queryKey: ['user-sites'] });
    queryClient.invalidateQueries({ queryKey: ['user-stars'] });
  };

  return { toggleStar };
}

export function useAddCustomDomain() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const addCustomDomain = async (siteDomain: string, customDomain: string) => {
    const res = await apiFetch(`/sites/${siteDomain}/custom-domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customDomain }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to add custom domain');
    }
    queryClient.invalidateQueries({ queryKey: ['custom-domains', siteDomain] });
    queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
  };

  return { addCustomDomain };
}

export function useVerifyCustomDomain() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const verifyCustomDomain = async (siteDomain: string, customDomain: string) => {
    const res = await apiFetch(`/sites/${siteDomain}/custom-domains/${customDomain}/verify`, {
      method: 'POST',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Verification failed');
    }
    queryClient.invalidateQueries({ queryKey: ['custom-domains', siteDomain] });
    queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
  };

  return { verifyCustomDomain };
}

export function useDeleteCustomDomain() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const deleteCustomDomain = async (siteDomain: string, customDomain: string) => {
    const res = await apiFetch(`/sites/${siteDomain}/custom-domains/${customDomain}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to remove custom domain');
    }
    queryClient.invalidateQueries({ queryKey: ['custom-domains', siteDomain] });
    queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
  };

  return { deleteCustomDomain };
}

export function useUpdateSiteMeta() {
  const { apiFetch } = useApi();

  const updateSiteMeta = async (domain: string, displayName: string) => {
    const res = await apiFetch(`/sites/${domain}/meta`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update site meta');
    }
  };

  return { updateSiteMeta };
}

export function useUpdateSiteConfig() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const updateSiteConfig = async (subdomain: string | null) => {
    const res = await apiFetch(`/sites/meta`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subdomain }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update subdomain');
    }
    queryClient.invalidateQueries({ queryKey: ['site-meta'] });
  };

  return { updateSiteConfig };
}

export function useUploadCover(domain: string) {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const uploadCover = async (file: File) => {
    const res = await apiFetch(`/sites/${domain}/cover`, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to upload cover');
    }
    queryClient.invalidateQueries({ queryKey: ['site', domain] });
  };

  return { uploadCover };
}

export function useDeleteCover(domain: string) {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const deleteCover = async () => {
    const res = await apiFetch(`/sites/${domain}/cover`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete cover');
    }
    queryClient.invalidateQueries({ queryKey: ['site', domain] });
  };

  return { deleteCover };
}

export function useUpdateDisplayName() {
  const { apiFetch } = useApi();

  const updateDisplayName = async (displayName: string) => {
    const res = await apiFetch('/auth/displayname', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update display name');
    }
  };

  return { updateDisplayName };
}

export function useUploadProfilePicture() {
  const { apiFetch } = useApi();

  const uploadProfilePicture = async (file: File) => {
    const res = await apiFetch('/auth/profile-picture', {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to upload profile picture');
    }
  };

  return { uploadProfilePicture };
}

export function useDeleteProfilePicture() {
  const { apiFetch } = useApi();

  const deleteProfilePicture = async () => {
    const res = await apiFetch('/auth/profile-picture/delete', {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete profile picture');
    }
  };

  return { deleteProfilePicture };
}
