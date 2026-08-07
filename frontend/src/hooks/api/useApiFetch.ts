import { useCallback } from 'react';
import { useConnection } from '../useConnection.ts';

export function useApiFetch() {
  const { apiBase, apiKey, sessionId, username } = useConnection();

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

  return { apiFetch };
}
