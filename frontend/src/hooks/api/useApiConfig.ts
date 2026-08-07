import { useConnection } from '../useConnection.ts';
import { parseApiBase } from '../../lib/utils.ts';

export function useApiConfig() {
  const { apiBase } = useConnection();
  const { host, hostWithPort, protocol } = parseApiBase(apiBase);
  return { apiBase, host, hostWithPort, protocol };
}
