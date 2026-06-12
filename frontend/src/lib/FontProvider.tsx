import { createContext, useContext, useState, type ReactNode } from 'react';

export type Font =
  | 'system'
  | 'system-ui'
  | 'noto-sans'
  | 'inter'
  | 'roboto'
  | 'arial'
  | 'verdana'
  | 'helvetica-neue'
  | 'sans-serif'
  | 'serif'
  | 'cursive'
  | 'monospace'
  | 'open-sans'
  | 'helvetica'
  | 'georgia'
  | 'tahoma'
  | 'trebuchet-ms'
  | 'menlo'
  | 'monaco'
  | 'lucida-grande'
  | 'lato'
  | 'courier-new'
  | 'consolas'
  | 'oswald'
  | 'times-new-roman'
  | 'pt-sans'
  | 'raleway'
  | 'jetbrains-mono'
  | 'montserrat'
  | 'exo'
  | 'exo-2'
  | 'rubik'
  | 'cinzel'
  | 'mona-sans'
  | 'noto-sans-mono';

export const fontNames: Partial<Record<Font, string>> = {
  'noto-sans': 'Noto Sans',
  inter: 'Inter',
  roboto: 'Roboto',
  'open-sans': 'Open Sans',
  lato: 'Lato',
  oswald: 'Oswald',
  'pt-sans': 'PT Sans',
  raleway: 'Raleway',
  'jetbrains-mono': 'JetBrains Mono',
  montserrat: 'Montserrat',
  exo: 'Exo',
  'exo-2': 'Exo 2',
  rubik: 'Rubik',
  cinzel: 'Cinzel',
  'mona-sans': 'Mona Sans',
  'noto-sans-mono': 'Noto Sans Mono',
};

const fontFamilies: Record<Font, string> = {
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  'system-ui': 'system-ui',
  'noto-sans': "'Noto Sans'",
  inter: "'Inter'",
  roboto: "'Roboto'",
  'open-sans': "'Open Sans'",
  arial: "'Arial'",
  verdana: "'Verdana'",
  'helvetica-neue': "'Helvetica Neue'",
  helvetica: "'Helvetica'",
  georgia: "'Georgia'",
  tahoma: "'Tahoma'",
  'trebuchet-ms': "'Trebuchet MS'",
  menlo: "'Menlo'",
  monaco: "'Monaco'",
  'lucida-grande': "'Lucida Grande'",
  lato: "'Lato'",
  'courier-new': "'Courier New'",
  consolas: "'Consolas'",
  oswald: "'Oswald'",
  'times-new-roman': "'Times New Roman'",
  'pt-sans': "'PT Sans'",
  raleway: "'Raleway'",
  'jetbrains-mono': "'JetBrains Mono'",
  montserrat: "'Montserrat'",
  exo: "'Exo'",
  'exo-2': "'Exo 2'",
  rubik: "'Rubik'",
  cinzel: "'Cinzel'",
  'mona-sans': "'Mona Sans'",
  'noto-sans-mono': "'Noto Sans Mono'",
  'sans-serif': 'sans-serif',
  serif: 'serif',
  cursive: 'cursive',
  monospace: 'monospace',
};

export const validFonts = Object.keys(fontFamilies) as Font[];

export function getFontFamily(font: Font): string {
  return fontFamilies[font] || fontFamilies.system;
}

export function applyFont(font: Font): void {
  document.getElementById('root')!.style.fontFamily = getFontFamily(font);
}

export async function waitForFont(font: Font): Promise<void> {
  const fontName = fontNames[font];
  if (!fontName) return;
  await document.fonts.load(`400 16px "${fontName}"`);
  await document.fonts.ready;
}

interface FontContextType {
  font: Font;
  setFont: (font: Font) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFontState] = useState<Font>(() => {
    const saved = localStorage.getItem('font') as Font | null;
    if (saved && validFonts.includes(saved as Font)) return saved as Font;
    return 'system';
  });

  const setFont = async (newFont: Font) => {
    localStorage.setItem('font', newFont);
    await waitForFont(newFont);
    applyFont(newFont);
    setFontState(newFont);
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
