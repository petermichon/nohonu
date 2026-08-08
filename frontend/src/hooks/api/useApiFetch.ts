import { useCallback } from 'react';
import { useConnection } from '../useConnection.ts';

export function useApiFetch() {
  const { apiBase, serverPassword, sessionId, username } = useConnection();

  const apiFetch = useCallback(
    (path: string, init?: RequestInit) => {
      const headers: HeadersInit = {
        ...(serverPassword ? { 'X-Server-Password': serverPassword } : {}),
        ...(sessionId ? { 'X-Session-Id': sessionId } : {}),
        ...(username ? { 'X-Username': username } : {}),
      };
      return fetch(`${apiBase}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
    },
    [apiBase, serverPassword, sessionId, username]
  );

  return { apiFetch };
}
