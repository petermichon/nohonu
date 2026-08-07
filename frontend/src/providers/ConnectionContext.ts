import { createContext } from 'react';
import type { ConnectionContextType } from '../lib/types.ts';

export const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);
