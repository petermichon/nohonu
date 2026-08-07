import { useState, type ReactNode } from 'react';
import { ConnectionContext } from './ConnectionContext.ts';
import type { Connection, ConnectionContextType } from '../lib/types.ts';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

const DEFAULT: Connection = {
  apiBase: API_BASE,
  apiKey: '',
  sessionId: '',
  username: '',
};

function load(): Connection {
  try {
    const apiKey = localStorage.getItem('apiKey');
    const sessionId = localStorage.getItem('sessionId');
    const username = localStorage.getItem('username');
    return {
      apiBase: API_BASE,
      apiKey: apiKey ?? DEFAULT.apiKey,
      sessionId: sessionId ?? DEFAULT.sessionId,
      username: username ?? DEFAULT.username,
    };
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [connection, setConnectionState] = useState<Connection>(load);

  const setApiKey = (key: string) => {
    localStorage.setItem('apiKey', key);
    setConnectionState((prev) => ({ ...prev, apiKey: key }));
  };

  const setSessionId = (sessionId: string) => {
    localStorage.setItem('sessionId', sessionId);
    setConnectionState((prev) => ({ ...prev, sessionId }));
  };

  const setUsername = (username: string) => {
    localStorage.setItem('username', username);
    setConnectionState((prev) => ({ ...prev, username }));
  };

  const disconnect = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    setConnectionState((prev) => ({
      ...prev,
      apiKey: '',
      sessionId: '',
      username: '',
    }));
  };

  const value: ConnectionContextType = {
    ...connection,
    setApiKey,
    setSessionId,
    setUsername,
    disconnect,
  };

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}
