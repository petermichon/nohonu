import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TopBar } from '../components/topbar/TopBar.tsx';
import { Footer } from '../components/Footer';
import { ToastProvider } from '../lib/ToastContext';
import { GlobalToast } from '../components/GlobalToast';
import { LanguageProvider } from '../lib/LanguageProvider';
import { FontProvider } from '../lib/FontProvider';
import { ThemeProvider } from '../lib/ThemeProvider';
import { AccentColorProvider } from '../lib/AccentColorProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConnectionProvider } from '../lib/ConnectionProvider';
import { queryClient } from '../lib/queryClient';

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <FontProvider>
          <ThemeProvider>
            <AccentColorProvider>
              <ConnectionProvider>
                <ToastProvider>
                  <RootLayout />
                </ToastProvider>
              </ConnectionProvider>
            </AccentColorProvider>
          </ThemeProvider>
        </FontProvider>
      </LanguageProvider>
    </QueryClientProvider>
  ),
});

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      <TopBar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <GlobalToast />
    </div>
  );
}
