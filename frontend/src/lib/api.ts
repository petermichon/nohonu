export { useConnection } from './ConnectionProvider';
import { useConnection } from './ConnectionProvider';

export function useApi() {
  const { apiBase, apiKey } = useConnection();
  const host = new URL(apiBase).host;
  const protocol = new URL(apiBase).protocol;
  const headers = (): HeadersInit => apiKey ? { 'X-Api-Key': apiKey } : {};
  const apiFetch = (path: string, init?: RequestInit) =>
    fetch(`${apiBase}${path}`, { ...init, headers: { ...headers(), ...init?.headers } });
  return { apiBase, apiKey, host, protocol, headers, apiFetch };
}
