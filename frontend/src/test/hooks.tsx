import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ConnectionContext } from '../providers/ConnectionContext.ts';
import type { ConnectionContextType } from '../lib/types.ts';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

export const TEST_CONNECTION: ConnectionContextType = {
  apiBase: 'http://api.test',
  sessionId: 'sess-123',
  username: 'peter',
  setSessionId: () => {},
  setUsername: () => {},
  disconnect: () => {},
};

export function renderHookWithProviders<Result, Props>(
  ui: (props: Props) => Result,
  options?: { initialProps?: Props; connection?: ConnectionContextType }
) {
  const queryClient = createQueryClient();
  const connection = options?.connection ?? TEST_CONNECTION;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ConnectionContext.Provider value={connection}>{children}</ConnectionContext.Provider>
    </QueryClientProvider>
  );
  return { ...renderHook(ui, { wrapper, initialProps: options?.initialProps }), queryClient };
}

export function mockFetch(response: unknown, status = 200) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(response), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
