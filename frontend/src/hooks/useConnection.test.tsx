import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ConnectionProvider } from '../providers/ConnectionProvider.tsx';
import { useConnection } from './useConnection.ts';

function renderConnection() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ConnectionProvider>{children}</ConnectionProvider>
  );
  return renderHook(() => useConnection(), { wrapper });
}

describe('ConnectionProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts with an empty connection', () => {
    const { result } = renderConnection();
    expect(result.current.sessionId).toBe('');
    expect(result.current.username).toBe('');
    expect(result.current.serverPassword).toBe('');
  });

  it('restores values from localStorage on mount', () => {
    localStorage.setItem('serverPassword', 'pw');
    localStorage.setItem('sessionId', 'sess-1');
    localStorage.setItem('username', 'peter');

    const { result } = renderConnection();
    expect(result.current.serverPassword).toBe('pw');
    expect(result.current.sessionId).toBe('sess-1');
    expect(result.current.username).toBe('peter');
  });

  it('persists and updates the session', () => {
    const { result } = renderConnection();
    act(() => {
      result.current.setSessionId('sess-2');
      result.current.setUsername('peter');
    });

    expect(result.current.sessionId).toBe('sess-2');
    expect(localStorage.getItem('sessionId')).toBe('sess-2');
    expect(localStorage.getItem('username')).toBe('peter');
  });

  it('persists the server password', () => {
    const { result } = renderConnection();
    act(() => {
      result.current.setServerPassword('secret');
    });

    expect(result.current.serverPassword).toBe('secret');
    expect(localStorage.getItem('serverPassword')).toBe('secret');
  });

  it('clears the session on disconnect but keeps the server password', () => {
    const { result } = renderConnection();
    act(() => {
      result.current.setSessionId('sess-3');
      result.current.setUsername('peter');
      result.current.setServerPassword('secret');
    });
    act(() => {
      result.current.disconnect();
    });

    expect(result.current.sessionId).toBe('');
    expect(result.current.username).toBe('');
    expect(result.current.serverPassword).toBe('secret');
    expect(localStorage.getItem('sessionId')).toBeNull();
  });
});
