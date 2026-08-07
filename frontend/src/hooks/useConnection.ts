import { useContext } from 'react';
import { ConnectionContext } from '../providers/ConnectionContext.ts';

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be used within a ConnectionProvider');
  return ctx;
}
