import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import './index.css';
import { applyFont, validFonts, waitForFont, type Font } from './lib/FontProvider';

const savedFont = localStorage.getItem('font');
const font = savedFont && validFonts.includes(savedFont as Font) ? (savedFont as Font) : 'outfit';

applyFont(font);
waitForFont(font).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
});
