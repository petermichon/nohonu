import { createContext, useContext, useState, type ReactNode, startTransition } from 'react';

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
  | 'outfit'
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
  | 'noto-sans-mono'
  | 'atkinson'
  | 'iceland'
  | 'figtree'
  | 'epilogue'
  | 'geist'
  | 'expletus-sans';

export const fontNames: Partial<Record<Font, string>> = {
  'noto-sans': 'Noto Sans Variable',
  inter: 'Inter Variable',
  roboto: 'Roboto Variable',
  'open-sans': 'Open Sans Variable',
  lato: 'Lato',
  oswald: 'Oswald Variable',
  outfit: 'Outfit Variable',
  'pt-sans': 'PT Sans',
  raleway: 'Raleway Variable',
  'jetbrains-mono': 'JetBrains Mono Variable',
  montserrat: 'Montserrat Variable',
  exo: 'Exo Variable',
  'exo-2': 'Exo 2 Variable',
  rubik: 'Rubik Variable',
  cinzel: 'Cinzel Variable',
  'mona-sans': 'Mona Sans Variable',
  'noto-sans-mono': 'Noto Sans Mono Variable',
  atkinson: 'Atkinson Hyperlegible',
  iceland: 'Iceland',
  figtree: 'Figtree Variable',
  epilogue: 'Epilogue Variable',
  geist: 'Geist Variable',
  'expletus-sans': 'Expletus Sans Variable',
};

const fontFamilies: Record<Font, string> = {
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  'system-ui': 'system-ui',
  'noto-sans': "'Noto Sans Variable'",
  inter: "'Inter Variable'",
  roboto: "'Roboto Variable'",
  'open-sans': "'Open Sans Variable'",
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
  oswald: "'Oswald Variable'",
  outfit: "'Outfit Variable'",
  'times-new-roman': "'Times New Roman'",
  'pt-sans': "'PT Sans'",
  raleway: "'Raleway Variable'",
  'jetbrains-mono': "'JetBrains Mono Variable'",
  montserrat: "'Montserrat Variable'",
  exo: "'Exo Variable'",
  'exo-2': "'Exo 2 Variable'",
  rubik: "'Rubik Variable'",
  cinzel: "'Cinzel Variable'",
  'mona-sans': "'Mona Sans Variable'",
  'noto-sans-mono': "'Noto Sans Mono Variable'",
  atkinson: "'Atkinson Hyperlegible'",
  iceland: "'Iceland'",
  figtree: "'Figtree Variable'",
  epilogue: "'Epilogue Variable'",
  geist: "'Geist Variable'",
  'expletus-sans': "'Expletus Sans Variable'",
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
  document.getElementById('root')!.style.setProperty('--font-family', getFontFamily(font));
}

export async function waitForFont(font: Font): Promise<void> {
  const fontName = fontNames[font];
  if (!fontName) return;
  const spec = `400 16px "${fontName}"`;
  if (document.fonts.check(spec)) return;
  await document.fonts.load(spec);
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
