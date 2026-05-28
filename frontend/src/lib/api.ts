import { useConnection } from './ConnectionProvider.tsx';

export function useApi() {
  const { apiBase, apiKey } = useConnection();
  let host = '';
  let protocol = 'http:';
  try {
    ({ host, protocol } = new URL(apiBase));
  } catch {
    /* invalid URL */
  }
  const apiFetch = (path: string, init?: RequestInit) => {
    const headers: HeadersInit = apiKey ? { 'X-Api-Key': apiKey } : {};
    return fetch(`${apiBase}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  };
  return { apiBase, apiKey, host, protocol, apiFetch };
}
