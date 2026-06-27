import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useConnection } from './ConnectionProvider.tsx';
import type { Site } from './types.ts';

export function useApi() {
  const { apiBase, apiKey, sessionId, username } = useConnection();
  let host = '';
  let protocol = 'http:';
  try {
    ({ host, protocol } = new URL(apiBase));
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
  return { apiBase, apiKey, sessionId, username, host, protocol, apiFetch };
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
