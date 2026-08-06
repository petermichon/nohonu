import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import './index.css';
import { applyFont, validFonts, waitForFont, type Font } from './providers/FontProvider';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

const savedFont = localStorage.getItem('font');
const font = savedFont && validFonts.includes(savedFont as Font) ? (savedFont as Font) : 'outfit';

applyFont(font);

// Ensure DOM is ready before rendering
function initApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    return;
  }

  // Render immediately, don't wait for font
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </StrictMode>
  );

  // Apply font asynchronously after render
  waitForFont(font).catch(() => {
    // Font loading failed, but app still works
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
