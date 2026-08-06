import { createContext, useContext, useState, type ReactNode, startTransition } from 'react';
import { applyFont, validFonts, waitForFont, type Font } from '../lib/font.ts';

interface FontContextType {
  font: Font;
  setFont: (font: Font) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFontState] = useState<Font>(() => {
    const saved = localStorage.getItem('font') as Font | null;
    if (saved && validFonts.includes(saved as Font)) return saved as Font;
    return 'outfit';
  });

  const setFont = (newFont: Font) => {
    localStorage.setItem('font', newFont);
    startTransition(async () => {
      await waitForFont(newFont);
      applyFont(newFont);
      setFontState(newFont);
    });
  };

  return <FontContext.Provider value={{ font, setFont }}>{children}</FontContext.Provider>;
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
