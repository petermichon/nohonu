import { createContext, useContext, useState, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

interface Connection {
  apiBase: string;
  apiKey: string;
  sessionId: string;
  username: string;
}

interface ConnectionContextType extends Connection {
  setApiKey: (key: string) => void;
  setSessionId: (sessionId: string) => void;
  setUsername: (username: string) => void;
  disconnect: () => void;
}

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

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

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

  return (
    <ConnectionContext.Provider
      value={{
        ...connection,
        setApiKey,
        setSessionId,
        setUsername,
        disconnect,
      }}
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
