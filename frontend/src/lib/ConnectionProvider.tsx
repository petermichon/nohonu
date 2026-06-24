import { createContext, useContext, useState, type ReactNode } from 'react';

interface Connection {
  apiBase: string;
  apiKey: string;
  username: string;
  displayName: string;
  email: string;
}

interface ConnectionContextType extends Connection {
  setConnection: (c: Connection) => void;
  setApiBase: (url: string) => void;
  setApiKey: (key: string) => void;
  setUsername: (username: string) => void;
  setDisplayName: (displayName: string) => void;
  setEmail: (email: string) => void;
  disconnect: () => void;
}

const DEFAULT: Connection = {
  apiBase: 'https://nohonu.com/api',
  apiKey: '',
  username: '',
  displayName: '',
  email: '',
};

function load(): Connection {
  try {
    const apiBase = localStorage.getItem('apiBase');
    const apiKey = localStorage.getItem('apiKey');
    const username = localStorage.getItem('username');
    const displayName = localStorage.getItem('displayName');
    const email = localStorage.getItem('email');
    return {
      apiBase: apiBase ?? DEFAULT.apiBase,
      apiKey: apiKey ?? DEFAULT.apiKey,
      username: username ?? DEFAULT.username,
      displayName: displayName ?? DEFAULT.displayName,
      email: email ?? DEFAULT.email,
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

  const setDisplayName = (d: string) => {
    localStorage.setItem('displayName', d);
    setConnectionState((prev) => ({ ...prev, displayName: d }));
  };

  const setEmail = (e: string) => {
    localStorage.setItem('email', e);
    setConnectionState((prev) => ({ ...prev, email: e }));
  };

  const disconnect = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('username');
    localStorage.removeItem('displayName');
    localStorage.removeItem('email');
    setConnectionState((prev) => ({ ...prev, apiKey: '', username: '', displayName: '', email: '' }));
  };

  return (
    <ConnectionContext.Provider
      value={{ ...connection, setConnection, setApiBase, setApiKey, setUsername, setDisplayName, setEmail, disconnect }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be used within a ConnectionProvider');
  return ctx;
}
