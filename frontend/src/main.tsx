import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './lib/ThemeProvider';
import { ConnectionProvider } from './lib/ConnectionProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConnectionProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ConnectionProvider>
  </StrictMode>
);
