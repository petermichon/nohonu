import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConnectionContext } from '../providers/ConnectionContext.ts';
import { AccentColorProvider } from '../providers/AccentColorProvider.tsx';
import { ToastProvider } from '../providers/ToastContext.tsx';
import { GlobalToast } from '../components/GlobalToast.tsx';
import { createQueryClient, TEST_CONNECTION } from './hooks.tsx';
import type { ConnectionContextType } from '../lib/types.ts';

export function renderWithProviders(
  ui: ReactNode,
  options?: { connection?: ConnectionContextType }
) {
  const queryClient = createQueryClient();
  const connection = options?.connection ?? TEST_CONNECTION;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ConnectionContext.Provider value={connection}>
        <AccentColorProvider>
          <ToastProvider>
            {children}
            <GlobalToast />
          </ToastProvider>
        </AccentColorProvider>
      </ConnectionContext.Provider>
    </QueryClientProvider>
  );
  return { ...render(ui, { wrapper }), queryClient };
}
