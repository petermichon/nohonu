import { createContext } from 'react';
import type { SiteShellContext } from '../../hooks/useSiteShell.ts';

export const SiteShellContext = createContext<SiteShellContext | undefined>(undefined);
