import { createContext, useContext, useState, type ReactNode } from 'react';

interface Connection {
  apiBase: string;
  apiKey: string;
}

interface ConnectionContextType extends Connection {
  setConnection: (c: Connection) => void;
}

const DEFAULT: Connection = {
  apiBase: 'http://localhost:8080',
  apiKey: '',
};

function load(): Connection {
  try {
    const raw = localStorage.getItem('connection');
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [connection, setConnectionState] = useState<Connection>(load);

  const setConnection = (c: Connection) => {
    localStorage.setItem('connection', JSON.stringify(c));
    setConnectionState(c);
  };

  return (
    <ConnectionContext.Provider value={{ ...connection, setConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be used within a ConnectionProvider');
  return ctx;
}
