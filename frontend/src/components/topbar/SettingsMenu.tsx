import { useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { MoreVertical, Sun, Moon, Languages, ChevronLeft, Type, Scale, Info, Palette } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider.tsx';
import { useLanguage } from '../../providers/LanguageProvider.tsx';
import { useFont } from '../../providers/FontProvider.tsx';
import { getFontFamily, type Font } from '../../lib/font.ts';
import { useAccentColor, type AccentColor, ACCENT_COLORS } from '../../providers/AccentColorProvider.tsx';
import { MenuSection } from './MenuSection.tsx';
import { useClickOutside } from '../../hooks/useClickOutside.ts';

type MenuView = 'main' | 'theme' | 'language' | 'font' | 'accent';

const MENU_ITEM_CLASS =
  'w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50';

const MENU_LINK_CLASS =
  'w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50';

export function SettingsMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>('main');
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { font, setFont } = useFont();
  const { accentColor, setAccentColor } = useAccentColor();

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(
    menuRef,
    () => {
      setIsMenuOpen(false);
      setMenuView('main');
    },
    isMenuOpen
  );

  const browserTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const themeOptions = [
    { value: 'system' as const, icon: browserTheme === 'dark' ? Moon : Sun, label: 'System', divider: true },
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
  ];

  const languageOptions = [
    {
      value: 'auto' as const,
      icon: navigator.language.toLowerCase().startsWith('fr') ? 'FR' : 'EN',
      label: 'System',
      divider: true,
    },
    { value: 'en' as const, icon: 'EN', label: 'English' },
    { value: 'fr' as const, icon: 'FR', label: 'Français' },
  ];

  const fontOptions = useMemo(
    () =>
      (
        [
          { value: 'outfit', label: 'Outfit' },
          { value: 'mona-sans', label: 'Mona Sans' },
          { value: 'urbanist', label: 'Urbanist' },
          { value: 'fredoka', label: 'Fredoka' },
        ] as Array<{ value: Font; label: string; divider?: boolean }>
      ).map((opt) => ({
        ...opt,
        icon: null,
        style: { fontFamily: getFontFamily(opt.value) },
      })),
    []
  );

  const accentColorOptions = (Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => ({
    value: color,
    icon: null,
    label: color === 'default' ? 'None' : color.charAt(0).toUpperCase() + color.slice(1),
    className: ACCENT_COLORS[color].text,
    divider: color === 'default',
  }));

  const closeMenu = () => {
    setIsMenuOpen(false);
    setMenuView('main');
  };

  return (
    <div className="relative hidden sm:block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50 cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-0.5 z-50 bg-zinc-50 dark:bg-zinc-950 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-2 w-[256px] max-h-[80vh] overflow-y-auto dropdown-animate">
          <div className="flex flex-col gap-0.5">
            {menuView === 'main' && (
              <>
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                  Settings
                </button>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                <button type="button" onClick={() => setMenuView('theme')} className={MENU_ITEM_CLASS}>
                  {theme === 'system' ? (
                    browserTheme === 'dark' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )
                  ) : theme === 'dark' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  <span>Theme</span>
                </button>
                <button type="button" onClick={() => setMenuView('language')} className={MENU_ITEM_CLASS}>
                  <Languages className="w-4 h-4" />
                  <span>Language</span>
                </button>
                <button type="button" onClick={() => setMenuView('font')} className={MENU_ITEM_CLASS}>
                  <Type className="w-4 h-4" />
                  <span>Font</span>
                </button>
                <button type="button" onClick={() => setMenuView('accent')} className={MENU_ITEM_CLASS}>
                  <Palette className="w-4 h-4" />
                  <span>Accent Color</span>
                </button>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                <Link to="/legal" onClick={closeMenu} className={MENU_LINK_CLASS}>
                  <Scale className="w-4 h-4" />
                  <span>Legal</span>
                </Link>
                <Link to="/about" onClick={closeMenu} className={MENU_LINK_CLASS}>
                  <Info className="w-4 h-4" />
                  <span>About</span>
                </Link>
              </>
            )}
            {menuView === 'theme' && (
              <MenuSection
                onBack={() => setMenuView('main')}
                backLabel="Theme"
                options={themeOptions}
                currentValue={theme}
                onSelect={(value) => setTheme(value as 'light' | 'dark' | 'system')}
              />
            )}
            {menuView === 'language' && (
              <MenuSection
                onBack={() => setMenuView('main')}
                backLabel="Language"
                options={languageOptions}
                currentValue={language}
                onSelect={(value) => setLanguage(value as 'auto' | 'en' | 'fr')}
              />
            )}
            {menuView === 'font' && (
              <MenuSection
                onBack={() => setMenuView('main')}
                backLabel="Font"
                options={fontOptions}
                currentValue={font}
                onSelect={(value) => setFont(value as Font)}
              />
            )}
            {menuView === 'accent' && (
              <MenuSection
                onBack={() => setMenuView('main')}
                backLabel="Accent Color"
                options={accentColorOptions}
                currentValue={accentColor}
                onSelect={(value) => setAccentColor(value as AccentColor)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
