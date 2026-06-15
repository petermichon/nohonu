import { createContext, useContext, useState, type ReactNode } from 'react';

interface Connection {
  apiBase: string;
  apiKey: string;
  username: string;
}

interface ConnectionContextType extends Connection {
  setConnection: (c: Connection) => void;
  setApiBase: (url: string) => void;
  setApiKey: (key: string) => void;
  setUsername: (username: string) => void;
}

const DEFAULT: Connection = {
  apiBase: 'https://nohonu.com/api',
  apiKey: '',
  username: '',
};

function load(): Connection {
  try {
    const apiBase = localStorage.getItem('apiBase');
    const apiKey = localStorage.getItem('apiKey');
    const username = localStorage.getItem('username');
    return {
      apiBase: apiBase ?? DEFAULT.apiBase,
      apiKey: apiKey ?? DEFAULT.apiKey,
      username: username ?? DEFAULT.username,
    };
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [connection, setConnectionState] = useState<Connection>(load);

  const setConnection = (c: Connection) => {
    localStorage.setItem('apiBase', c.apiBase);
    localStorage.setItem('apiKey', c.apiKey);
    setConnectionState(c);
  };

  const setApiBase = (url: string) => {
    localStorage.setItem('apiBase', url);
    setConnectionState((prev) => ({ ...prev, apiBase: url }));
  };

  const setApiKey = (key: string) => {
    localStorage.setItem('apiKey', key);
    setConnectionState((prev) => ({ ...prev, apiKey: key }));
  };

  const setUsername = (u: string) => {
    localStorage.setItem('username', u);
    setConnectionState((prev) => ({ ...prev, username: u }));
  };

  return (
    <ConnectionContext.Provider value={{ ...connection, setConnection, setApiBase, setApiKey, setUsername }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be used within a ConnectionProvider');
  return ctx;
}
