import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Connection {
  apiBase: string;
  apiKey: string;
  sessionId: string;
  username: string;
  displayName: string;
  email: string;
}

interface ConnectionContextType extends Connection {
  setConnection: (c: Connection) => void;
  setApiBase: (url: string) => void;
  setApiKey: (key: string) => void;
  setSessionId: (sessionId: string) => void;
  disconnect: () => void;
}

const DEFAULT: Connection = {
  apiBase: 'https://nohonu.com/api',
  apiKey: '',
  sessionId: '',
  username: '',
  displayName: '',
  email: '',
};

function load(): Connection {
  try {
    const apiBase = localStorage.getItem('apiBase');
    const apiKey = localStorage.getItem('apiKey');
    const sessionId = localStorage.getItem('sessionId');
    return {
      apiBase: apiBase ?? DEFAULT.apiBase,
      apiKey: apiKey ?? DEFAULT.apiKey,
      sessionId: sessionId ?? DEFAULT.sessionId,
      username: DEFAULT.username,
      displayName: DEFAULT.displayName,
      email: DEFAULT.email,
    };
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [connection, setConnectionState] = useState<Connection>(load);

  useEffect(() => {
    const fetchUserData = async () => {
      if (connection.sessionId && connection.apiBase) {
        try {
          const headers: HeadersInit = {
            ...(connection.apiKey ? { 'X-Api-Key': connection.apiKey } : {}),
            'X-Session-Id': connection.sessionId,
          };
          const res = await fetch(`${connection.apiBase}/auth/me`, { headers });
          if (res.ok) {
            const data = await res.json();
            setConnectionState((prev) => ({
              ...prev,
              username: data.user?.username || '',
              displayName: data.user?.displayName || '',
              email: data.user?.email || '',
            }));
          }
        } catch {
          // Silent fail - user data will remain empty
        }
      }
    };
    fetchUserData();
  }, [connection.sessionId, connection.apiBase, connection.apiKey]);

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

  const setSessionId = (sessionId: string) => {
    localStorage.setItem('sessionId', sessionId);
    setConnectionState((prev) => ({ ...prev, sessionId }));
  };

  const disconnect = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('sessionId');
    setConnectionState((prev) => ({ ...prev, apiKey: '', sessionId: '', username: '', displayName: '', email: '' }));
  };

  return (
    <ConnectionContext.Provider
      value={{
        ...connection,
        setConnection,
        setApiBase,
        setApiKey,
        setSessionId,
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
