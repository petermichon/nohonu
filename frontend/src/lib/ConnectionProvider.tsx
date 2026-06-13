import { createContext, useContext, useState, type ReactNode } from 'react';

interface Connection {
  apiBase: string;
  apiKey: string;
}

interface ConnectionContextType extends Connection {
  setConnection: (c: Connection) => void;
  setApiBase: (url: string) => void;
  setApiKey: (key: string) => void;
}

const DEFAULT: Connection = {
  apiBase: 'https://nohonu.com/api',
  apiKey: '',
};

function load(): Connection {
  try {
    const apiBase = localStorage.getItem('apiBase');
    const apiKey = localStorage.getItem('apiKey');
    return {
      apiBase: apiBase || DEFAULT.apiBase,
      apiKey: apiKey || DEFAULT.apiKey,
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

  return (
    <ConnectionContext.Provider value={{ ...connection, setConnection, setApiBase, setApiKey }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be used within a ConnectionProvider');
  return ctx;
}
