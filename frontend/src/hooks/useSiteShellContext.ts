import { useContext } from 'react';
import { SiteShellContext } from '../components/sitepage/SiteShellContext.ts';

export function useSiteShellContext() {
  const ctx = useContext(SiteShellContext);
  if (!ctx) throw new Error('useSiteShellContext must be used within SiteShell');
  return ctx;
}
