import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type AccentColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';

// Centralized accent color configuration
export const ACCENT_COLORS = {
  default: {
    bg: 'bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200',
    bgLight: 'bg-zinc-50 dark:bg-zinc-800',
    bgLighter: 'bg-zinc-50 dark:bg-zinc-950',
    dot: 'bg-zinc-950 dark:bg-zinc-100',
    line: 'bg-zinc-200 dark:bg-zinc-700',
    text: 'text-zinc-950 dark:text-zinc-100',
    textDark: 'text-zinc-800 dark:text-zinc-200',
    textLight: 'text-zinc-600 dark:text-zinc-400',
    textLightOnly: 'text-zinc-500',
    focus: 'focus:ring-zinc-500',
    link: 'text-zinc-950 dark:text-zinc-100 hover:text-zinc-700 dark:hover:text-zinc-300',
    rgb: '250, 250, 250',
    particles: {
      light: ['#09090b', '#18181b', '#27272a'],
      dark: ['#fafafa', '#fafafa', '#fafafa'],
    },
    gradient: 'zinc-950',
    textColor: 'inverted',
    selectionTextColor: '9, 9, 11',
  },
  red: {
    bg: 'bg-red-500 hover:bg-red-500/90',
    bgLight: 'bg-red-100 dark:bg-red-900/30',
    bgLighter: 'bg-red-50 dark:bg-red-900/40',
    dot: 'bg-red-400',
    line: 'bg-red-200 dark:bg-red-800',
    text: 'text-red-500',
    textDark: 'text-red-600 dark:text-red-400',
    textLight: 'text-red-400 dark:text-red-500',
    textLightOnly: 'text-red-400',
    focus: 'focus:ring-red-500',
    link: 'text-red-500 hover:text-red-600 dark:hover:text-red-400',
    rgb: '239, 68, 68',
    particles: {
      light: ['#7f1d1d', '#991b1b', '#b91c1c'],
      dark: ['#ef4444', '#f87171', '#fca5a5'],
    },
    gradient: 'red-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  orange: {
    bg: 'bg-orange-500 hover:bg-orange-500/90',
    bgLight: 'bg-orange-100 dark:bg-orange-900/30',
    bgLighter: 'bg-orange-50 dark:bg-orange-900/40',
    dot: 'bg-orange-400',
    line: 'bg-orange-200 dark:bg-orange-800',
    text: 'text-orange-500',
    textDark: 'text-orange-600 dark:text-orange-400',
    textLight: 'text-orange-400 dark:text-orange-500',
    textLightOnly: 'text-orange-400',
    focus: 'focus:ring-orange-500',
    link: 'text-orange-500 hover:text-orange-600 dark:hover:text-orange-400',
    rgb: '249, 115, 22',
    particles: {
      light: ['#7c2d12', '#9a3412', '#c2410c'],
      dark: ['#f97316', '#fb923c', '#fdba74'],
    },
    gradient: 'orange-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  amber: {
    bg: 'bg-amber-500 hover:bg-amber-500/90',
    bgLight: 'bg-amber-100 dark:bg-amber-900/30',
    bgLighter: 'bg-amber-50 dark:bg-amber-900/40',
    dot: 'bg-amber-400',
    line: 'bg-amber-200 dark:bg-amber-800',
    text: 'text-amber-500',
    textDark: 'text-amber-600 dark:text-amber-400',
    textLight: 'text-amber-400 dark:text-amber-500',
    textLightOnly: 'text-amber-400',
    focus: 'focus:ring-amber-500',
    link: 'text-amber-500 hover:text-amber-600 dark:hover:text-amber-400',
    rgb: '245, 158, 11',
    particles: {
      light: ['#78350f', '#92400e', '#b45309'],
      dark: ['#f59e0b', '#fbbf24', '#fcd34d'],
    },
    gradient: 'amber-500',
    textColor: 'dark',
    selectionTextColor: '9, 9, 11',
  },
  yellow: {
    bg: 'bg-yellow-500 hover:bg-yellow-500/90',
    bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
    bgLighter: 'bg-yellow-50 dark:bg-yellow-900/40',
    dot: 'bg-yellow-400',
    line: 'bg-yellow-200 dark:bg-yellow-800',
    text: 'text-yellow-500',
    textDark: 'text-yellow-600 dark:text-yellow-400',
    textLight: 'text-yellow-400 dark:text-yellow-500',
    textLightOnly: 'text-yellow-400',
    focus: 'focus:ring-yellow-500',
    link: 'text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400',
    rgb: '234, 179, 8',
    particles: {
      light: ['#713f12', '#854d0e', '#a16207'],
      dark: ['#eab308', '#facc15', '#fde047'],
    },
    gradient: 'yellow-500',
    textColor: 'dark',
    selectionTextColor: '9, 9, 11',
  },
  lime: {
    bg: 'bg-lime-500 hover:bg-lime-500/90',
    bgLight: 'bg-lime-100 dark:bg-lime-900/30',
    bgLighter: 'bg-lime-50 dark:bg-lime-900/40',
    dot: 'bg-lime-400',
    line: 'bg-lime-200 dark:bg-lime-800',
    text: 'text-lime-500',
    textDark: 'text-lime-600 dark:text-lime-400',
    textLight: 'text-lime-400 dark:text-lime-500',
    textLightOnly: 'text-lime-400',
    focus: 'focus:ring-lime-500',
    link: 'text-lime-500 hover:text-lime-600 dark:hover:text-lime-400',
    rgb: '132, 204, 22',
    particles: {
      light: ['#365314', '#3f6212', '#4d7c0f'],
      dark: ['#84cc16', '#a3e635', '#bef264'],
    },
    gradient: 'lime-500',
    textColor: 'dark',
    selectionTextColor: '9, 9, 11',
  },
  green: {
    bg: 'bg-green-500 hover:bg-green-500/90',
    bgLight: 'bg-green-100 dark:bg-green-900/30',
    bgLighter: 'bg-green-50 dark:bg-green-900/40',
    dot: 'bg-green-400',
    line: 'bg-green-200 dark:bg-green-800',
    text: 'text-green-500',
    textDark: 'text-green-600 dark:text-green-400',
    textLight: 'text-green-400 dark:text-green-500',
    textLightOnly: 'text-green-400',
    focus: 'focus:ring-green-500',
    link: 'text-green-500 hover:text-green-600 dark:hover:text-green-400',
    rgb: '34, 197, 94',
    particles: {
      light: ['#14532d', '#166534', '#15803d'],
      dark: ['#22c55e', '#4ade80', '#86efac'],
    },
    gradient: 'green-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  emerald: {
    bg: 'bg-emerald-500 hover:bg-emerald-500/90',
    bgLight: 'bg-emerald-100 dark:bg-emerald-900/30',
    bgLighter: 'bg-emerald-50 dark:bg-emerald-900/40',
    dot: 'bg-emerald-400',
    line: 'bg-emerald-200 dark:bg-emerald-800',
    text: 'text-emerald-500',
    textDark: 'text-emerald-600 dark:text-emerald-400',
    textLight: 'text-emerald-400 dark:text-emerald-500',
    textLightOnly: 'text-emerald-400',
    focus: 'focus:ring-emerald-500',
    link: 'text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400',
    rgb: '16, 185, 129',
    particles: {
      light: ['#064e3b', '#065f46', '#047857'],
      dark: ['#10b981', '#34d399', '#6ee7b7'],
    },
    gradient: 'emerald-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  teal: {
    bg: 'bg-teal-500 hover:bg-teal-500/90',
    bgLight: 'bg-teal-100 dark:bg-teal-900/30',
    bgLighter: 'bg-teal-50 dark:bg-teal-900/40',
    dot: 'bg-teal-400',
    line: 'bg-teal-200 dark:bg-teal-800',
    text: 'text-teal-500',
    textDark: 'text-teal-600 dark:text-teal-400',
    textLight: 'text-teal-400 dark:text-teal-500',
    textLightOnly: 'text-teal-400',
    focus: 'focus:ring-teal-500',
    link: 'text-teal-500 hover:text-teal-600 dark:hover:text-teal-400',
    rgb: '20, 184, 166',
    particles: {
      light: ['#134e4a', '#115e59', '#0f766e'],
      dark: ['#14b8a6', '#2dd4bf', '#5eead4'],
    },
    gradient: 'teal-500',
    textColor: 'dark',
    selectionTextColor: '9, 9, 11',
  },
  cyan: {
    bg: 'bg-cyan-500 hover:bg-cyan-500/90',
    bgLight: 'bg-cyan-100 dark:bg-cyan-900/30',
    bgLighter: 'bg-cyan-50 dark:bg-cyan-900/40',
    dot: 'bg-cyan-400',
    line: 'bg-cyan-200 dark:bg-cyan-800',
    text: 'text-cyan-500',
    textDark: 'text-cyan-600 dark:text-cyan-400',
    textLight: 'text-cyan-400 dark:text-cyan-500',
    textLightOnly: 'text-cyan-400',
    focus: 'focus:ring-cyan-500',
    link: 'text-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400',
    rgb: '6, 182, 212',
    particles: {
      light: ['#164e63', '#155e75', '#0e7490'],
      dark: ['#06b6d4', '#22d3ee', '#67e8f9'],
    },
    gradient: 'cyan-500',
    textColor: 'dark',
    selectionTextColor: '9, 9, 11',
  },
  sky: {
    bg: 'bg-sky-500 hover:bg-sky-500/90',
    bgLight: 'bg-sky-100 dark:bg-sky-900/30',
    bgLighter: 'bg-sky-50 dark:bg-sky-900/40',
    dot: 'bg-sky-400',
    line: 'bg-sky-200 dark:bg-sky-800',
    text: 'text-sky-500',
    textDark: 'text-sky-600 dark:text-sky-400',
    textLight: 'text-sky-400 dark:text-sky-500',
    textLightOnly: 'text-sky-400',
    focus: 'focus:ring-sky-500',
    link: 'text-sky-500 hover:text-sky-600 dark:hover:text-sky-400',
    rgb: '14, 165, 233',
    particles: {
      light: ['#0c4a6e', '#075985', '#0369a1'],
      dark: ['#0ea5e9', '#38bdf8', '#7dd3fc'],
    },
    gradient: 'sky-500',
    textColor: 'dark',
    selectionTextColor: '9, 9, 11',
  },
  blue: {
    bg: 'bg-blue-500 hover:bg-blue-500/90',
    bgLight: 'bg-blue-100 dark:bg-blue-900/30',
    bgLighter: 'bg-blue-50 dark:bg-blue-900/40',
    dot: 'bg-blue-400',
    line: 'bg-blue-200 dark:bg-blue-800',
    text: 'text-blue-500',
    textDark: 'text-blue-600 dark:text-blue-400',
    textLight: 'text-blue-400 dark:text-blue-500',
    textLightOnly: 'text-blue-400',
    focus: 'focus:ring-blue-500',
    link: 'text-blue-500 hover:text-blue-600 dark:hover:text-blue-400',
    rgb: '59, 130, 246',
    particles: {
      light: ['#1e3a8a', '#1e40af', '#1d4ed8'],
      dark: ['#3b82f6', '#60a5fa', '#93c5fd'],
    },
    gradient: 'blue-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  indigo: {
    bg: 'bg-indigo-500 hover:bg-indigo-500/90',
    bgLight: 'bg-indigo-100 dark:bg-indigo-900/30',
    bgLighter: 'bg-indigo-50 dark:bg-indigo-900/40',
    dot: 'bg-indigo-400',
    line: 'bg-indigo-200 dark:bg-indigo-800',
    text: 'text-indigo-500',
    textDark: 'text-indigo-600 dark:text-indigo-400',
    textLight: 'text-indigo-400 dark:text-indigo-500',
    textLightOnly: 'text-indigo-400',
    focus: 'focus:ring-indigo-500',
    link: 'text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400',
    rgb: '99, 102, 241',
    particles: {
      light: ['#312e81', '#3730a3', '#4338ca'],
      dark: ['#6366f1', '#818cf8', '#a5b4fc'],
    },
    gradient: 'indigo-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  violet: {
    bg: 'bg-violet-500 hover:bg-violet-500/90',
    bgLight: 'bg-violet-100 dark:bg-violet-900/30',
    bgLighter: 'bg-violet-50 dark:bg-violet-900/40',
    dot: 'bg-violet-400',
    line: 'bg-violet-200 dark:bg-violet-800',
    text: 'text-violet-500',
    textDark: 'text-violet-600 dark:text-violet-400',
    textLight: 'text-violet-400 dark:text-violet-500',
    textLightOnly: 'text-violet-400',
    focus: 'focus:ring-violet-500',
    link: 'text-violet-500 hover:text-violet-600 dark:hover:text-violet-400',
    rgb: '139, 92, 246',
    particles: {
      light: ['#5b21b6', '#6d28d9', '#7c3aed'],
      dark: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    },
    gradient: 'violet-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  purple: {
    bg: 'bg-purple-500 hover:bg-purple-500/90',
    bgLight: 'bg-purple-100 dark:bg-purple-900/30',
    bgLighter: 'bg-purple-50 dark:bg-purple-900/40',
    dot: 'bg-purple-400',
    line: 'bg-purple-200 dark:bg-purple-800',
    text: 'text-purple-500',
    textDark: 'text-purple-600 dark:text-purple-400',
    textLight: 'text-purple-400 dark:text-purple-500',
    textLightOnly: 'text-purple-400',
    focus: 'focus:ring-purple-500',
    link: 'text-purple-500 hover:text-purple-600 dark:hover:text-purple-400',
    rgb: '168, 85, 247',
    particles: {
      light: ['#581c87', '#6b21a8', '#7e22ce'],
      dark: ['#a855f7', '#c084fc', '#d8b4fe'],
    },
    gradient: 'purple-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500 hover:bg-fuchsia-500/90',
    bgLight: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
    bgLighter: 'bg-fuchsia-50 dark:bg-fuchsia-900/40',
    dot: 'bg-fuchsia-400',
    line: 'bg-fuchsia-200 dark:bg-fuchsia-800',
    text: 'text-fuchsia-500',
    textDark: 'text-fuchsia-600 dark:text-fuchsia-400',
    textLight: 'text-fuchsia-400 dark:text-fuchsia-500',
    textLightOnly: 'text-fuchsia-400',
    focus: 'focus:ring-fuchsia-500',
    link: 'text-fuchsia-500 hover:text-fuchsia-600 dark:hover:text-fuchsia-400',
    rgb: '217, 70, 239',
    particles: {
      light: ['#701a75', '#86198f', '#a21caf'],
      dark: ['#d946ef', '#e879f9', '#f0abfc'],
    },
    gradient: 'fuchsia-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  pink: {
    bg: 'bg-pink-500 hover:bg-pink-500/90',
    bgLight: 'bg-pink-100 dark:bg-pink-900/30',
    bgLighter: 'bg-pink-50 dark:bg-pink-900/40',
    dot: 'bg-pink-400',
    line: 'bg-pink-200 dark:bg-pink-800',
    text: 'text-pink-500',
    textDark: 'text-pink-600 dark:text-pink-400',
    textLight: 'text-pink-400 dark:text-pink-500',
    textLightOnly: 'text-pink-400',
    focus: 'focus:ring-pink-500',
    link: 'text-pink-500 hover:text-pink-600 dark:hover:text-pink-400',
    rgb: '236, 72, 153',
    particles: {
      light: ['#831843', '#9d174d', '#be185d'],
      dark: ['#ec4899', '#f472b6', '#f9a8d4'],
    },
    gradient: 'pink-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
  rose: {
    bg: 'bg-rose-500 hover:bg-rose-500/90',
    bgLight: 'bg-rose-100 dark:bg-rose-900/30',
    bgLighter: 'bg-rose-50 dark:bg-rose-900/40',
    dot: 'bg-rose-400',
    line: 'bg-rose-200 dark:bg-rose-800',
    text: 'text-rose-500',
    textDark: 'text-rose-600 dark:text-rose-400',
    textLight: 'text-rose-400 dark:text-rose-500',
    textLightOnly: 'text-rose-400',
    focus: 'focus:ring-rose-500',
    link: 'text-rose-500 hover:text-rose-600 dark:hover:text-rose-400',
    rgb: '244, 63, 94',
    particles: {
      light: ['#881337', '#9f1239', '#be123c'],
      dark: ['#f43f5e', '#fb7185', '#fda4af'],
    },
    gradient: 'rose-500',
    textColor: 'light',
    selectionTextColor: '250, 250, 250',
  },
} as const;

interface AccentColorContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  getAccentColorClass: (shade?: 400 | 500 | 600) => string;
  getAccentColorValues: () => (typeof ACCENT_COLORS)[AccentColor];
}

const AccentColorContext = createContext<AccentColorContextType | undefined>(undefined);

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('accentColor');
    const validColors = Object.keys(ACCENT_COLORS) as AccentColor[];
    if (saved && validColors.includes(saved as AccentColor)) {
      return saved as AccentColor;
    }
    return 'indigo';
  });

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    // Update CSS variable for text selection color
    const rgb = ACCENT_COLORS[accentColor].rgb;
    const selectionTextColor = ACCENT_COLORS[accentColor].selectionTextColor || '255, 255, 255';
    document.documentElement.style.setProperty('--selection-color', `rgb(${rgb})`);
    document.documentElement.style.setProperty('--selection-text-color', `rgb(${selectionTextColor})`);
  }, [accentColor]);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  const getAccentColorClass = (shade: 400 | 500 | 600 = 500): string => {
    return `${accentColor}-${shade}`;
  };

  const getAccentColorValues = () => {
    return ACCENT_COLORS[accentColor];
  };

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor, getAccentColorClass, getAccentColorValues }}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  const context = useContext(AccentColorContext);
  if (context === undefined) {
    throw new Error('useAccentColor must be used within an AccentColorProvider');
  }
  return context;
}
