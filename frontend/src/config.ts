import { parseApiBase } from './lib/utils.ts';

export const apiBase = import.meta.env.VITE_API_BASE ?? '/api';

export const { host, hostWithPort, protocol } = parseApiBase(apiBase);
