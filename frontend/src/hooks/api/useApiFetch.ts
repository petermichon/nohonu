import { useCallback } from 'react';
import { useConnection } from '../useConnection.ts';

export function useApiFetch() {
  const { apiBase, sessionId, username } = useConnection();

  const apiFetch = useCallback(
    (path: string, init?: RequestInit) => {
      const headers: HeadersInit = {
        ...(sessionId ? { 'X-Session-Id': sessionId } : {}),
        ...(username ? { 'X-Username': username } : {}),
      };
      return fetch(`${apiBase}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
    },
    [apiBase, sessionId, username]
  );

  return { apiFetch };
}
