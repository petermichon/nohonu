import { createContext } from 'react';
import type { SiteShellContext as SiteShellContextValue } from '../../hooks/useSiteShell.ts';

export const SiteShellContext = createContext<SiteShellContextValue | undefined>(undefined);
