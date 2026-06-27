import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './lib/ThemeProvider.tsx';
import { ConnectionProvider } from './lib/ConnectionProvider.tsx';
import { AccentColorProvider } from './lib/AccentColorProvider.tsx';
import { applyFont, validFonts, waitForFont, type Font } from './lib/FontProvider.tsx';

const queryClient = new QueryClient();

const savedFont = localStorage.getItem('font');
const font = savedFont && validFonts.includes(savedFont as Font) ? (savedFont as Font) : 'outfit';

applyFont(font);
waitForFont(font).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <AccentColorProvider>
          <QueryClientProvider client={queryClient}>
            <ConnectionProvider>
              <App />
            </ConnectionProvider>
          </QueryClientProvider>
        </AccentColorProvider>
      </ThemeProvider>
    </StrictMode>
  );
});
