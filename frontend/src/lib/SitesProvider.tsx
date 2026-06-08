import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useApi } from './api.ts';
import type { Site } from './types.ts';

interface SitesContextValue {
  sites: Site[];
  loading: boolean;
  error: false | 'connection' | 'unauthorized';
  refreshSites: () => Promise<void>;
}

const SitesContext = createContext<SitesContextValue | null>(null);

export function SitesProvider({ children }: { children: ReactNode }) {
  const { apiFetch } = useApi();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<false | 'connection' | 'unauthorized'>(false);

  const refreshSites = useCallback(async () => {
    setError(false);
    try {
      const res = await apiFetch('/sites');
      if (res.status === 401) {
        setError('unauthorized');
        return;
      }
      const data = await res.json();
      setSites(data.sites || []);
    } catch {
      setError('connection');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    refreshSites();
  }, [refreshSites]);

  return (
    <SitesContext.Provider value={{ sites, loading, error, refreshSites }}>
      {children}
    </SitesContext.Provider>
  );
}

export function useSites() {
  const context = useContext(SitesContext);
  if (!context) {
    throw new Error('useSites must be used within a SitesProvider');
  }
  return context;
}
