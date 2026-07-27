import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useConnection } from './ConnectionProvider.tsx';
import type { Site } from './types.ts';

export function useApi() {
  const { apiBase, apiKey, sessionId, username } = useConnection();
  let host = '';
  let hostWithPort = '';
  let protocol = 'http:';
  try {
    ({ host, protocol } = new URL(apiBase));
    hostWithPort = host;
    // Strip port from host for subdomain URLs
    host = host.split(':')[0];
  } catch {
    /* invalid URL */
  }
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

interface CustomDomainEntry {
  siteDomain: string;
  customDomain: string;
  verified: boolean;
}

export function useDomains() {
  const { apiFetch } = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['custom-domains'],
    queryFn: async () => {
      const res = await apiFetch('/custom-domains');
      const data = await res.json();
      return (data.customDomains ?? []) as CustomDomainEntry[];
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

interface Session {
  id: string;
  username: string;
  userAgent?: string;
  createdAt: number;
  lastActive: number;
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
