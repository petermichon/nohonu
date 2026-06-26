import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './lib/ThemeProvider.tsx';
import { ConnectionProvider } from './lib/ConnectionProvider.tsx';
import { AccentColorProvider } from './lib/AccentColorProvider.tsx';
import { SitesProvider } from './lib/SitesProvider.tsx';
import { DomainsProvider } from './lib/DomainsProvider.tsx';
import { applyFont, validFonts, waitForFont, type Font } from './lib/FontProvider.tsx';

const savedFont = localStorage.getItem('font');
const font = savedFont && validFonts.includes(savedFont as Font) ? (savedFont as Font) : 'outfit';

applyFont(font);
waitForFont(font).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ConnectionProvider>
        <ThemeProvider>
          <AccentColorProvider>
            <SitesProvider>
              <DomainsProvider>
                <App />
              </DomainsProvider>
            </SitesProvider>
          </AccentColorProvider>
        </ThemeProvider>
      </ConnectionProvider>
    </StrictMode>
  );
});
