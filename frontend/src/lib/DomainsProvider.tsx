import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useApi } from './api.ts';

interface CustomDomainEntry {
  siteDomain: string;
  customDomain: string;
  verified: boolean;
}

interface DomainsContextValue {
  domains: CustomDomainEntry[];
  loading: boolean;
  refreshDomains: () => Promise<void>;
}

const DomainsContext = createContext<DomainsContextValue | null>(null);

export function DomainsProvider({ children }: { children: ReactNode }) {
  const { apiFetch } = useApi();
  const [domains, setDomains] = useState<CustomDomainEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshDomains = useCallback(async () => {
    try {
      const res = await apiFetch('/custom-domains');
      const data = await res.json();
      setDomains((data.customDomains as CustomDomainEntry[]) ?? []);
    } catch {
      // non-critical, silently fail
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      refreshDomains();
    }
  }, [refreshDomains]);

  return <DomainsContext.Provider value={{ domains, loading, refreshDomains }}>{children}</DomainsContext.Provider>;
}

export function useDomains() {
  const context = useContext(DomainsContext);
  if (!context) {
    throw new Error('useDomains must be used within a DomainsProvider');
  }
  return context;
}
