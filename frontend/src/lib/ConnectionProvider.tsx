import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
console.log('API URL:', API_BASE);

interface Connection {
  apiBase: string;
  apiKey: string;
  sessionId: string;
  username: string;
  displayName: string;
  profilePicture?: string;
}

interface ConnectionContextType extends Connection {
  setApiKey: (key: string) => void;
  setSessionId: (sessionId: string) => void;
  setUsername: (username: string) => void;
  setDisplayName: (displayName: string) => void;
  disconnect: () => void;
}

const DEFAULT: Connection = {
  apiBase: API_BASE,
  apiKey: '',
  sessionId: '',
  username: '',
  displayName: '',
  profilePicture: undefined,
};

function load(): Connection {
  try {
    const apiKey = localStorage.getItem('apiKey');
    const sessionId = localStorage.getItem('sessionId');
    const username = localStorage.getItem('username');
    const displayName = localStorage.getItem('displayName');
    return {
      apiBase: API_BASE,
      apiKey: apiKey ?? DEFAULT.apiKey,
      sessionId: sessionId ?? DEFAULT.sessionId,
      username: username ?? DEFAULT.username,
      displayName: displayName || username || DEFAULT.displayName,
      profilePicture: DEFAULT.profilePicture,
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
            const displayName = data.user?.displayName || connection.username;
            localStorage.setItem('displayName', displayName);
            setConnectionState((prev) => ({
              ...prev,
              username: data.user?.username || '',
              displayName,
              profilePicture: data.user?.profilePicture,
            }));
          }
        } catch {
          // Silent fail - user data will remain empty
        }
      }
    };
    fetchUserData();
  }, [connection.sessionId, connection.apiBase, connection.apiKey]);

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

  const setDisplayName = (displayName: string) => {
    localStorage.setItem('displayName', displayName);
    setConnectionState((prev) => ({ ...prev, displayName }));
  };

  const disconnect = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    localStorage.removeItem('displayName');
    setConnectionState((prev) => ({
      ...prev,
      apiKey: '',
      sessionId: '',
      username: '',
      displayName: '',
      profilePicture: undefined,
    }));
  };

  return (
    <ConnectionContext.Provider
      value={{
        ...connection,
        setApiKey,
        setSessionId,
        setUsername,
        setDisplayName,
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
