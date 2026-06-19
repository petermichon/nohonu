import { Link, useLocation } from 'react-router-dom';
import { User, MoreVertical, Sun, Moon, Languages, Check, ChevronLeft, LogIn, Type, Scale, Info } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../lib/ThemeProvider.tsx';
import { useLanguage } from '../lib/LanguageProvider.tsx';
import { useFont, getFontFamily, type Font } from '../lib/FontProvider.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useState } from 'react';

interface MenuSectionProps {
  onBack: () => void;
  backLabel: string;
  options: Array<{
    value: string;
    icon: React.ComponentType<{ className?: string }> | string | null;
    label: string;
    divider?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }>;
  currentValue: string;
  onSelect: (value: string) => void;
  children?: React.ReactNode;
}

function MenuSection({ onBack, backLabel, options, currentValue, onSelect }: MenuSectionProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        <ChevronLeft className="w-4 h-4" />
        {backLabel}
      </button>
      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
      {options.map(({ value, icon: Icon, label, divider, className, style }) => (
        <React.Fragment key={value}>
          <button
            type="button"
            onClick={() => onSelect(value)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            {Icon === null ? (
              <span className="w-4 h-4" />
            ) : typeof Icon === 'string' ? (
              <span className="w-4 h-4 flex items-center justify-center text-xs font-semibold">{Icon}</span>
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span className={className} style={style}>
              {label}
            </span>
            <Check
              className={`ml-auto w-4 h-4 transition-opacity ${currentValue === value ? 'opacity-100 text-zinc-900 dark:text-zinc-50' : 'opacity-0 text-zinc-900 dark:text-zinc-50'}`}
            />
          </button>
          {divider && <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />}
        </React.Fragment>
      ))}
    </>
  );
}

export function TopBar() {
  const { displayName, username } = useConnection();
  const location = useLocation();
  const userName = displayName || 'Guest';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'theme' | 'language' | 'font'>('main');
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { font, setFont } = useFont();

  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setMenuView('main');
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const browserTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const isActive = (path: string) => {
    if (path === '/explore' && location.pathname === '/explore') {
      return true;
    }
    if (path === '/sites' && (location.pathname === '/sites' || (username && location.pathname === `/u/${username}`))) {
      return true;
    }
    if (
      path === '/domains' &&
      (location.pathname === '/domains' || (username && location.pathname === `/u/${username}/domains`))
    ) {
      return true;
    }
    if (
      path === '/servers' &&
      (location.pathname === '/servers' || (username && location.pathname === `/u/${username}/servers`))
    ) {
      return true;
    }
    return false;
  };

  const profileOptions = username
    ? [
        { to: `/u/${username}`, label: 'Profile' },
        { to: '/account', label: 'Account' },
      ]
    : [{ to: '/account', label: 'Account' }];

  const themeOptions = [
    {
      value: 'system' as const,
      icon: browserTheme === 'dark' ? Moon : Sun,
      label: 'System',
      divider: true,
    },
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

  const fontOptions = (
    [
      { value: 'system', label: 'System' },
      { value: 'system-ui', label: 'System UI', divider: true },
      { value: 'sans-serif', label: 'Sans-serif' },
      { value: 'serif', label: 'Serif' },
      { value: 'cursive', label: 'Cursive' },
      { value: 'monospace', label: 'Monospace', divider: true },
      { value: 'inter', label: 'Inter' },
      { value: 'noto-sans', label: 'Noto Sans' },
      { value: 'roboto', label: 'Roboto' },
      { value: 'open-sans', label: 'Open Sans' },
      { value: 'lato', label: 'Lato' },
      { value: 'oswald', label: 'Oswald' },
      { value: 'outfit', label: 'Outfit' },
      { value: 'pt-sans', label: 'PT Sans' },
      { value: 'raleway', label: 'Raleway' },
      { value: 'montserrat', label: 'Montserrat' },
      { value: 'exo', label: 'Exo' },
      { value: 'exo-2', label: 'Exo 2' },
      { value: 'rubik', label: 'Rubik' },
      { value: 'cinzel', label: 'Cinzel' },
      { value: 'mona-sans', label: 'Mona Sans' },
      { value: 'noto-sans-mono', label: 'Noto Sans Mono' },
      { value: 'atkinson', label: 'Atkinson Hyperlegible' },
      { value: 'iceland', label: 'Iceland' },
      { value: 'figtree', label: 'Figtree' },
      { value: 'geist', label: 'Geist' },
      { value: 'expletus-sans', label: 'Expletus Sans' },
      { value: 'jetbrains-mono', label: 'JetBrains Mono', divider: true },
      { value: 'arial', label: 'Arial' },
      { value: 'verdana', label: 'Verdana' },
      { value: 'tahoma', label: 'Tahoma' },
      { value: 'lucida-grande', label: 'Lucida Grande' },
      { value: 'helvetica-neue', label: 'Helvetica Neue' },
      { value: 'helvetica', label: 'Helvetica' },
      { value: 'trebuchet-ms', label: 'Trebuchet MS', divider: true },
      { value: 'georgia', label: 'Georgia' },
      { value: 'times-new-roman', label: 'Times New Roman', divider: true },
      { value: 'courier-new', label: 'Courier New' },
      { value: 'consolas', label: 'Consolas' },
      { value: 'menlo', label: 'Menlo' },
      { value: 'monaco', label: 'Monaco' },
    ] as Array<{ value: Font; label: string; divider?: boolean }>
  ).map((opt) => ({
    ...opt,
    icon: null,
    style: { fontFamily: getFontFamily(opt.value) },
  }));

  return (
    <header className="h-16 shrink-0 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-950 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full flex items-center justify-between gap-2 max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="font-semibold text-xl text-zinc-900 dark:text-zinc-50 tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              nohonu
            </span>
          </Link>
          <div className="hidden sm:flex items-center ml-5">
            <Link
              to="/explore"
              className={`flex items-center gap-2 px-3 h-8 rounded-lg text-sm font-normal transition-colors ${isActive('/explore') ? 'text-zinc-900 dark:text-zinc-50 font-semibold' : 'text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Explore
            </Link>
            <Link
              to={username ? `/u/${username}` : '/sites'}
              className={`flex items-center gap-2 px-3 h-8 rounded-lg text-sm font-normal transition-colors ${isActive('/sites') ? 'text-zinc-900 dark:text-zinc-50 font-semibold' : 'text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Sites
            </Link>
            <Link
              to={username ? `/u/${username}/domains` : '/domains'}
              className={`flex items-center gap-2 px-3 h-8 rounded-lg text-sm font-normal transition-colors ${isActive('/domains') ? 'text-zinc-900 dark:text-zinc-50 font-semibold' : 'text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Domains
            </Link>
            <Link
              to={username ? `/u/${username}/servers` : '/servers'}
              className={`flex items-center gap-2 px-3 h-8 rounded-lg text-sm font-normal transition-colors ${isActive('/servers') ? 'text-zinc-900 dark:text-zinc-50 font-semibold' : 'text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Servers
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 h-full">
          <div className="relative hidden sm:block" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-0.5 z-50 bg-zinc-50 dark:bg-zinc-950 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-2 w-[260px] max-h-[80vh] overflow-y-auto dropdown-animate">
                <div className="flex flex-col gap-0.5">
                  {menuView === 'main' && (
                    <>
                      <button
                        type="button"
                        disabled
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400"
                      >
                        <ChevronLeft className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        Settings
                      </button>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                      <button
                        type="button"
                        onClick={() => setMenuView('theme')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
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
                      <button
                        type="button"
                        onClick={() => setMenuView('language')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
                        <Languages className="w-4 h-4" />
                        <span>Language</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuView('font')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
                        <Type className="w-4 h-4" />
                        <span>Font</span>
                      </button>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                      <Link
                        to="/legal"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMenuView('main');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
                        <Scale className="w-4 h-4" />
                        <span>Legal</span>
                      </Link>
                      <Link
                        to="/about"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMenuView('main');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                      >
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
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors select-none"
            >
              <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-0.5 z-50 bg-zinc-50 dark:bg-zinc-950 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-2 w-[260px] max-h-[80vh] overflow-y-auto dropdown-animate">
                <div className="flex items-start gap-2 px-3 py-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{userName}</span>
                    {username && <span className="text-sm text-zinc-500 dark:text-zinc-400 -mt-1">{username}</span>}
                  </div>
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                <div className="flex flex-col gap-0.5">
                  {profileOptions.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => {
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                    >
                      {label === 'Account' && <User className="w-4 h-4" />}
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                <Link
                  to="/account"
                  onClick={() => {
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" /> <span>Sign in</span>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 h-9 hidden sm:flex">
            <Link
              to="/account"
              className="px-4 h-full rounded-full text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center"
            >
              Log in
            </Link>
            <button
              type="button"
              className="px-4 h-full rounded-full text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-500/90 cursor-pointer transition-colors whitespace-nowrap"
            >
              Deploy
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
