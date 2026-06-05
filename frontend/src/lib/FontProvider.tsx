import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Font =
  | 'system'
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
  | 'cinzel';

interface FontContextType {
  font: Font;
  setFont: (font: Font) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState<Font>(() => {
    const saved = localStorage.getItem('font') as Font | null;
    if (
      saved === 'inter' ||
      saved === 'system' ||
      saved === 'roboto' ||
      saved === 'arial' ||
      saved === 'verdana' ||
      saved === 'helvetica-neue' ||
      saved === 'sans-serif' ||
      saved === 'serif' ||
      saved === 'cursive' ||
      saved === 'monospace' ||
      saved === 'open-sans' ||
      saved === 'helvetica' ||
      saved === 'georgia' ||
      saved === 'tahoma' ||
      saved === 'trebuchet-ms' ||
      saved === 'menlo' ||
      saved === 'monaco' ||
      saved === 'lucida-grande' ||
      saved === 'lato' ||
      saved === 'courier-new' ||
      saved === 'consolas' ||
      saved === 'oswald' ||
      saved === 'times-new-roman' ||
      saved === 'pt-sans' ||
      saved === 'raleway' ||
      saved === 'jetbrains-mono' ||
      saved === 'montserrat' ||
      saved === 'exo' ||
      saved === 'exo-2' ||
      saved === 'rubik' ||
      saved === 'cinzel'
    )
      return saved;
    return 'system';
  });

  useEffect(() => {
    localStorage.setItem('font', font);

    switch (font) {
      case 'inter':
        document.body.style.fontFamily =
          "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        break;
      case 'roboto':
        document.body.style.fontFamily =
          "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        break;
      case 'open-sans':
        document.body.style.fontFamily =
          "'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        break;
      case 'arial':
        document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
        break;
      case 'verdana':
        document.body.style.fontFamily = 'Verdana, Geneva, sans-serif';
        break;
      case 'helvetica-neue':
        document.body.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
        break;
      case 'helvetica':
        document.body.style.fontFamily = 'Helvetica, Arial, sans-serif';
        break;
      case 'georgia':
        document.body.style.fontFamily = 'Georgia, serif';
        break;
      case 'tahoma':
        document.body.style.fontFamily = 'Tahoma, Geneva, sans-serif';
        break;
      case 'trebuchet-ms':
        document.body.style.fontFamily = '"Trebuchet MS", Helvetica, sans-serif';
        break;
      case 'menlo':
        document.body.style.fontFamily = 'Menlo, Monaco, "Courier New", monospace';
        break;
      case 'monaco':
        document.body.style.fontFamily = 'Monaco, "Courier New", monospace';
        break;
      case 'lucida-grande':
        document.body.style.fontFamily = '"Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, sans-serif';
        break;
      case 'lato':
        document.body.style.fontFamily = '"Lato", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        break;
      case 'courier-new':
        document.body.style.fontFamily = '"Courier New", Courier, monospace';
        break;
      case 'consolas':
        document.body.style.fontFamily = 'Consolas, "Courier New", monospace';
        break;
      case 'oswald':
        document.body.style.fontFamily =
          '"Oswald", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        break;
      case 'times-new-roman':
        document.body.style.fontFamily = '"Times New Roman", Times, serif';
        break;
      case 'pt-sans':
        document.body.style.fontFamily =
          '"PT Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        break;
      case 'raleway':
        document.body.style.fontFamily =
          '"Raleway", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        break;
      case 'jetbrains-mono':
        document.body.style.fontFamily = '"JetBrains Mono", monospace';
        break;
      case 'montserrat':
        document.body.style.fontFamily =
          '"Montserrat", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        break;
      case 'exo':
        document.body.style.fontFamily = '"Exo", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        break;
      case 'exo-2':
        document.body.style.fontFamily =
          '"Exo 2", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        break;
      case 'rubik':
        document.body.style.fontFamily =
          '"Rubik", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        break;
      case 'cinzel':
        document.body.style.fontFamily = '"Cinzel", serif';
        break;
      case 'sans-serif':
        document.body.style.fontFamily = 'sans-serif';
        break;
      case 'serif':
        document.body.style.fontFamily = 'serif';
        break;
      case 'cursive':
        document.body.style.fontFamily = 'cursive';
        break;
      case 'monospace':
        document.body.style.fontFamily =
          "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace";
        break;
      case 'system':
      default:
        document.body.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        break;
    }
  }, [font]);

  return <FontContext.Provider value={{ font, setFont }}>{children}</FontContext.Provider>;
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
