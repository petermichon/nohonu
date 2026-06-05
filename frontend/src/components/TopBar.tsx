import { Link } from 'react-router-dom';
import { User, MoreVertical, Sun, Moon, Languages, Check, ChevronLeft, LogIn, Type } from 'lucide-react';
import React from 'react';
import { useTheme } from '../lib/ThemeProvider.tsx';
import { useLanguage } from '../lib/LanguageProvider.tsx';
import { useFont } from '../lib/FontProvider.tsx';
import { useState } from 'react';
import { Logo } from './Logo.tsx';

interface MenuSectionProps {
  onBack: () => void;
  backLabel: string;
  options: Array<{
    value: string;
    icon: React.ComponentType<{ className?: string }> | string;
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
  // TODO: Replace with real auth state when authentication is implemented
  const isConnected = false;
  const userName = isConnected ? 'User Name' : 'Guest';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'theme' | 'language' | 'font'>('main');
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { font, setFont } = useFont();

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

  const fontOptions = [
    {
      value: 'system' as const,
      icon: null,
      label: 'System',
      divider: true,
      className: '',
      style: { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    },
    { value: 'sans-serif' as const, icon: null, label: 'Sans-serif', className: 'font-sans' },
    { value: 'serif' as const, icon: null, label: 'Serif', className: 'font-serif' },
    { value: 'cursive' as const, icon: null, label: 'Cursive', className: '', style: { fontFamily: 'cursive' } },
    { value: 'monospace' as const, icon: null, label: 'Monospace', divider: true, className: 'font-mono' },
    { value: 'inter' as const, icon: null, label: 'Inter', className: "font-['Inter']" },
    { value: 'roboto' as const, icon: null, label: 'Roboto', className: "font-['Roboto']" },
    { value: 'open-sans' as const, icon: null, label: 'Open Sans', className: "font-['Open_Sans']" },
    { value: 'lato' as const, icon: null, label: 'Lato', className: "font-['Lato']" },
    { value: 'oswald' as const, icon: null, label: 'Oswald', className: "font-['Oswald']" },
    { value: 'pt-sans' as const, icon: null, label: 'PT Sans', className: "font-['PT_Sans']" },
    { value: 'raleway' as const, icon: null, label: 'Raleway', divider: true, className: "font-['Raleway']" },
    { value: 'lucida-grande' as const, icon: null, label: 'Lucida Grande', className: "font-['Lucida_Grande']" },
    { value: 'arial' as const, icon: null, label: 'Arial', className: "font-['Arial']" },
    { value: 'verdana' as const, icon: null, label: 'Verdana', className: "font-['Verdana']" },
    { value: 'helvetica-neue' as const, icon: null, label: 'Helvetica Neue', className: "font-['Helvetica_Neue']" },
    { value: 'helvetica' as const, icon: null, label: 'Helvetica', className: "font-['Helvetica']" },
    { value: 'tahoma' as const, icon: null, label: 'Tahoma', className: "font-['Tahoma']" },
    {
      value: 'trebuchet-ms' as const,
      icon: null,
      label: 'Trebuchet MS',
      divider: true,
      className: "font-['Trebuchet_MS']",
    },
    { value: 'georgia' as const, icon: null, label: 'Georgia', className: "font-['Georgia']" },
    {
      value: 'times-new-roman' as const,
      icon: null,
      label: 'Times New Roman',
      divider: true,
      className: "font-['Times_New_Roman']",
    },
    {
      value: 'courier-new' as const,
      icon: null,
      label: 'Courier New',
      divider: true,
      className: "font-['Courier_New']",
    },
    { value: 'consolas' as const, icon: null, label: 'Consolas', className: "font-['Consolas']" },
    { value: 'menlo' as const, icon: null, label: 'Menlo', className: "font-['Menlo']" },
    { value: 'monaco' as const, icon: null, label: 'Monaco', className: "font-['Monaco']" },
  ];

  return (
    <header className="h-14 shrink-0 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 sticky top-0 z-30">
      <div className="h-full flex items-center justify-between gap-2">
        <Link
          to="/"
          className="flex items-center gap-2 w-64 h-full px-4 border-r border-stone-200 dark:border-stone-800"
        >
          <Logo />
          <span className="font-bold text-stone-900 dark:text-stone-100 tracking-tight">Nohonu</span>
        </Link>
        <div className="flex items-center gap-2 px-3 sm:px-6">
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
                <div className="absolute right-0 top-full mt-2 z-50 bg-stone-50 dark:bg-stone-950 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 p-2 w-[228px] max-h-[80vh] overflow-y-auto">
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
                      </>
                    )}
                    {menuView === 'theme' && (
                      <MenuSection
                        onBack={() => setMenuView('main')}
                        backLabel="Theme"
                        options={themeOptions}
                        currentValue={theme}
                        onSelect={setTheme}
                      />
                    )}
                    {menuView === 'language' && (
                      <MenuSection
                        onBack={() => setMenuView('main')}
                        backLabel="Language"
                        options={languageOptions}
                        currentValue={language}
                        onSelect={setLanguage}
                      />
                    )}
                    {menuView === 'font' && (
                      <MenuSection
                        onBack={() => setMenuView('main')}
                        backLabel="Font"
                        options={fontOptions}
                        currentValue={font}
                        onSelect={setFont}
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
                <div className="absolute right-0 top-full mt-2 z-50 bg-stone-50 dark:bg-stone-950 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 p-2 w-[228px] max-h-[80vh] overflow-y-auto">
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
    </header>
  );
}
