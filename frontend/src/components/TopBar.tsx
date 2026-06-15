import { Link, useLocation } from 'react-router-dom';
import {
  User,
  MoreVertical,
  Sun,
  Moon,
  Languages,
  Check,
  ChevronLeft,
  LogIn,
  Type,
  Menu,
  Scale,
  Info,
} from 'lucide-react';
import React from 'react';
import { useTheme } from '../lib/ThemeProvider.tsx';
import { useLanguage } from '../lib/LanguageProvider.tsx';
import { useFont, getFontFamily, type Font } from '../lib/FontProvider.tsx';
import { useSidebar } from '../lib/SidebarProvider.tsx';
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
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
      >
        <ChevronLeft className="w-4 h-4" />
        {backLabel}
      </button>
      <div className="border-t border-stone-200 dark:border-stone-700 my-1" />
      {options.map(({ value, icon: Icon, label, divider, className, style }) => (
        <React.Fragment key={value}>
          <button
            type="button"
            onClick={() => onSelect(value)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
          >
            {Icon === null ? (
              <span className="w-4 h-4" />
            ) : typeof Icon === 'string' ? (
              <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">{Icon}</span>
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span className={className} style={style}>
              {label}
            </span>
            <Check
              className={`ml-auto w-4 h-4 transition-opacity ${currentValue === value ? 'opacity-100 text-stone-900 dark:text-stone-100' : 'opacity-0 text-stone-900 dark:text-stone-100'}`}
            />
          </button>
          {divider && <div className="border-t border-stone-200 dark:border-stone-700 my-1" />}
        </React.Fragment>
      ))}
    </>
  );
}

export function TopBar() {
  const location = useLocation();
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  // TODO: Replace with real auth state when authentication is implemented
  const isConnected = false;
  const userName = isConnected ? 'User Name' : 'Guest';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'theme' | 'language' | 'font'>('main');
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { font, setFont } = useFont();

  const getPathSegments = () => {
    const segments = [{ label: 'Home', to: '/' }];
    if (location.pathname === '/') return segments;
    if (location.pathname === '/sites') return [...segments, { label: 'Sites', to: '/sites' }];
    if (location.pathname.startsWith('/sites/')) {
      const domain = location.pathname.split('/')[2];
      return [...segments, { label: 'Sites', to: '/sites' }, { label: domain, to: `/sites/${domain}` }];
    }
    if (location.pathname === '/domains') return [...segments, { label: 'Domains', to: '/domains' }];
    if (location.pathname === '/domains/explore')
      return [...segments, { label: 'Domains', to: '/domains' }, { label: 'Explore', to: '/domains/explore' }];
    if (location.pathname === '/servers') return [...segments, { label: 'Servers', to: '/servers' }];
    if (location.pathname === '/about') return [...segments, { label: 'About', to: '/about' }];
    if (location.pathname === '/account') return [...segments, { label: 'Account', to: '/account' }];
    if (location.pathname === '/legal') return [...segments, { label: 'Legal', to: '/legal' }];
    if (location.pathname === '/legal/privacy-policy')
      return [...segments, { label: 'Legal', to: '/legal' }, { label: 'Privacy Policy', to: '/legal/privacy-policy' }];
    if (location.pathname === '/legal/terms-of-service')
      return [
        ...segments,
        { label: 'Legal', to: '/legal' },
        { label: 'Terms of Service', to: '/legal/terms-of-service' },
      ];
    if (location.pathname === '/legal/copyright-policy')
      return [
        ...segments,
        { label: 'Legal', to: '/legal' },
        { label: 'Copyright Policy', to: '/legal/copyright-policy' },
      ];
    if (location.pathname === '/legal/mentions-legales')
      return [
        ...segments,
        { label: 'Legal', to: '/legal' },
        { label: 'Mentions légales', to: '/legal/mentions-legales' },
      ];
    return segments;
  };

  const pathSegments = getPathSegments();

  const browserTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const profileOptions = isConnected
    ? [
        { to: '/account', label: 'Profile' },
        { to: '/account', label: 'Security' },
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
    <header className="h-14 shrink-0 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 sticky top-0 z-30">
      <div className="h-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-48 p-2">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="md:hidden flex items-center justify-center gap-3 w-10 h-10 rounded-lg text-sm font-medium cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
            title={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Menu className="w-4 h-4 shrink-0" />
          </button>
        </div>
        <div className="hidden sm:flex flex-1 items-center justify-center px-4">
          <div className="text-xs font-medium text-stone-400 dark:text-stone-500 tracking-wider">
            {pathSegments.map((segment, index) => (
              <span key={segment.to}>
                {index > 0 && ' / '}
                {index === pathSegments.length - 1 ? (
                  <Link
                    to={segment.to}
                    className="text-stone-900 dark:text-stone-100 font-medium hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg px-3 py-2"
                  >
                    {segment.label}
                  </Link>
                ) : (
                  <Link
                    to={segment.to}
                    className="hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg px-3 py-2"
                  >
                    {segment.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="w-48 h-full">
          <div className="flex items-center justify-center gap-2 w-full h-full">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setMenuView('main');
                    }}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 bg-stone-50 dark:bg-stone-950 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 p-2 w-[260px] max-h-[80vh] overflow-y-auto">
                    <div className="flex flex-col gap-0.5">
                      {menuView === 'main' && (
                        <>
                          <button
                            type="button"
                            disabled
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400"
                          >
                            <ChevronLeft className="w-4 h-4 text-stone-400 dark:text-stone-600" />
                            Settings
                          </button>
                          <div className="border-t border-stone-200 dark:border-stone-700 my-1" />
                          <button
                            type="button"
                            onClick={() => setMenuView('theme')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
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
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
                          >
                            <Languages className="w-4 h-4" />
                            <span>Language</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMenuView('font')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
                          >
                            <Type className="w-4 h-4" />
                            <span>Font</span>
                          </button>
                          <div className="border-t border-stone-200 dark:border-stone-700 my-1" />
                          <Link
                            to="/legal"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setMenuView('main');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
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
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
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
                </>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                </div>
                <span className="hidden sm:inline min-w-12 text-left">{userName}</span>
              </button>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 bg-stone-50 dark:bg-stone-950 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 p-2 w-[260px] max-h-[80vh] overflow-y-auto">
                    <div className="flex flex-col gap-0.5">
                      {profileOptions.map(({ to, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => {
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
                        >
                          {label === 'Account' && <User className="w-4 h-4" />}
                          <span>{label}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-stone-200 dark:border-stone-700 my-1" />
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                    >
                      {isConnected ? (
                        'Sign out'
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" /> <span>Sign in</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
