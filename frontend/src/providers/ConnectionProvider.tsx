import { useState, type ReactNode } from 'react';
import { ConnectionContext } from './ConnectionContext.ts';
import type { Connection, ConnectionContextType } from '../lib/types.ts';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

const DEFAULT: Connection = {
  apiBase: API_BASE,
  serverPassword: '',
  sessionId: '',
  username: '',
};

function load(): Connection {
  try {
    const serverPassword = localStorage.getItem('serverPassword');
    const sessionId = localStorage.getItem('sessionId');
    const username = localStorage.getItem('username');
    return {
      apiBase: API_BASE,
      serverPassword: serverPassword ?? DEFAULT.serverPassword,
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

  const setServerPassword = (key: string) => {
    localStorage.setItem('serverPassword', key);
    setConnectionState((prev) => ({ ...prev, serverPassword: key }));
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
    localStorage.removeItem('serverPassword');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    setConnectionState((prev) => ({
      ...prev,
      serverPassword: '',
      sessionId: '',
      username: '',
    }));
  };

  const value: ConnectionContextType = {
    ...connection,
    setServerPassword,
    setSessionId,
    setUsername,
    disconnect,
  };

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}
