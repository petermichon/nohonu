import { useConnection } from '../../hooks/useConnection.ts';
import { parseApiBase } from '../../lib/utils.ts';
import { useCallback } from 'react';

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
