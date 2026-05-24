import { useConnection } from './ConnectionProvider';

export function useApi() {
  const { apiBase, apiKey } = useConnection();
  let host = '';
  let protocol = 'http:';
  try { ({ host, protocol } = new URL(apiBase)); } catch { /* invalid URL */ }
  const headers = (): HeadersInit => apiKey ? { 'X-Api-Key': apiKey } : {};
  const apiFetch = (path: string, init?: RequestInit) =>
    fetch(`${apiBase}${path}`, { ...init, headers: { ...headers(), ...init?.headers } });
  return { apiBase, apiKey, host, protocol, headers, apiFetch };
}
