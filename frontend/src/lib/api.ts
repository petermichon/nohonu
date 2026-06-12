import { useCallback } from 'react';
import { useConnection } from './ConnectionProvider.tsx';

export function useApi() {
  const { apiBase, apiKey } = useConnection();
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
      const headers: HeadersInit = apiKey ? { 'X-Api-Key': apiKey } : {};
      return fetch(`${apiBase}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
    },
    [apiBase, apiKey]
  );
  return { apiBase, apiKey, host, protocol, apiFetch };
}
