import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import {
  User,
  MoreVertical,
  Sun,
  Moon,
  Languages,
  Check,
  ChevronLeft,
  Type,
  Scale,
  Info,
  Palette,
  LogIn,
  LogOut,
  Globe,
  Server,
  Layout,
  Settings,
} from 'lucide-react';
import { useLogout, useApi } from '../lib/api.ts';
import React, { useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../lib/ThemeProvider.tsx';
import { useLanguage } from '../lib/LanguageProvider.tsx';
import { useFont, getFontFamily, type Font } from '../lib/FontProvider.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useAccentColor, type AccentColor, ACCENT_COLORS } from '../lib/AccentColorProvider.tsx';
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

interface NavButtonProps {
  to: string;
  label: string;
  isActive: boolean;
}

function NavButton({ to, label, isActive: active }: NavButtonProps) {
  return (
    <div className="h-full flex items-center group cursor-pointer group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800">
      <Link
        to={to}
        className={`relative flex items-center justify-center gap-2 px-3 h-8 rounded-lg text-sm font-normal ${active ? 'text-zinc-950 dark:text-zinc-50 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800' : 'text-zinc-950 dark:text-zinc-50 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800'}`}
      >
        <span className="invisible">{label}</span>
        <span className="absolute inset-0 flex items-center justify-center">{label}</span>
      </Link>
    </div>
  );
}

function MenuSection({ onBack, backLabel, options, currentValue, onSelect }: MenuSectionProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            {Icon === null ? (
              <span className="w-4 h-4 shrink-0" />
            ) : typeof Icon === 'string' ? (
              <span className="w-4 h-4 flex items-center justify-center text-xs font-semibold shrink-0">{Icon}</span>
            ) : (
              <Icon className="w-4 h-4 shrink-0" />
            )}
            <span
              className={`${className} flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left`}
              style={style}
            >
              {label}
            </span>
            <Check
              className={`ml-auto w-4 h-4 shrink-0 transition-opacity ${currentValue === value ? 'opacity-100 text-zinc-950 dark:text-zinc-50' : 'opacity-0 text-zinc-950 dark:text-zinc-50'}`}
            />
          </button>
          {divider && <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />}
        </React.Fragment>
      ))}
    </>
  );
}

export function TopBar() {
  const { displayName, username, disconnect, profilePicture } = useConnection();
  const { apiBase } = useApi();
  const { logout } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const userName = displayName || username || 'Connect';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'theme' | 'language' | 'font' | 'accent'>('main');
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { font, setFont } = useFont();
  const { accentColor, setAccentColor, getAccentColorValues } = useAccentColor();

  const accentColorValues = getAccentColorValues();
  const buttonBaseClass = `px-4 h-full rounded-full text-sm font-medium ${
    accentColorValues.textColor === 'light'
      ? 'text-white'
      : accentColorValues.textColor === 'inverted'
        ? 'text-zinc-100 dark:text-zinc-950'
        : 'text-zinc-950'
  } cursor-pointer flex items-center justify-center whitespace-nowrap`;

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

  type ProfileOption = {
    route: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    divider?: boolean;
  };

  const profileOptions: ProfileOption[] = username
    ? [
        { route: '/u/$username', label: 'Profile', icon: User, divider: false },
        {
          route: '/u/$username/sites',
          label: 'Sites',
          icon: Layout,
          divider: false,
        },
        { route: '/u/$username/domains', label: 'Domains', icon: Globe, divider: false },
        {
          route: '/u/$username/servers',
          label: 'Servers',
          icon: Server,
          divider: true,
        },
        { route: '/u/$username/settings', label: 'Settings', icon: Settings, divider: false },
      ]
    : [{ route: '/account', label: 'Settings', icon: Settings, divider: false }];

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

  const fontOptions = useMemo(
    () =>
      (
        [
          { value: 'system', label: 'System' },
          { value: 'system-ui', label: 'System UI', divider: true },
          { value: 'sans-serif', label: 'Sans-serif' },
          { value: 'serif', label: 'Serif' },
          { value: 'cursive', label: 'Cursive' },
          { value: 'monospace', label: 'Monospace', divider: true },
          { value: 'outfit', label: 'Outfit' },
          { value: 'mona-sans', label: 'Mona Sans' },
          { value: 'urbanist', label: 'Urbanist' },
          { value: 'inter', label: 'Inter' },
          { value: 'noto-sans', label: 'Noto Sans' },
          { value: 'roboto', label: 'Roboto' },
          { value: 'open-sans', label: 'Open Sans' },
          { value: 'oswald', label: 'Oswald' },
          { value: 'raleway', label: 'Raleway' },
          { value: 'montserrat', label: 'Montserrat' },
          { value: 'exo', label: 'Exo' },
          { value: 'exo-2', label: 'Exo 2' },
          { value: 'rubik', label: 'Rubik' },
          { value: 'cinzel', label: 'Cinzel' },
          { value: 'noto-sans-mono', label: 'Noto Sans Mono' },
          { value: 'atkinson', label: 'Atkinson Hyperlegible Next' },
          { value: 'figtree', label: 'Figtree' },
          { value: 'epilogue', label: 'Epilogue' },
          { value: 'geist', label: 'Geist' },
          { value: 'expletus-sans', label: 'Expletus Sans' },
          { value: 'jetbrains-mono', label: 'JetBrains Mono', divider: true },
          { value: 'lato', label: 'Lato' },
          { value: 'pt-sans', label: 'PT Sans' },
          { value: 'iceland', label: 'Iceland', divider: true },
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

  return (
    <header className="h-16 shrink-0 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full flex items-center justify-between gap-2 max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center h-full">
          <Link to="/" className="flex items-center gap-2 relative group">
            <div
              className="absolute top-1 left-4 w-1 h-1 rounded-full opacity-0 transition-transform duration-75 group-hover:opacity-100 group-hover:-translate-y-3"
              style={{
                backgroundColor:
                  accentColor === 'default' && theme === 'light'
                    ? 'rgb(9, 9, 11)'
                    : accentColor === 'default' && theme === 'dark'
                      ? 'rgb(250, 250, 250)'
                      : `rgb(${accentColorValues.rgb})`,
              }}
            />
            <div
              className="absolute top-0 left-6 w-1 h-1 rounded-full opacity-0 transition-transform duration-75 group-hover:opacity-100 group-hover:-translate-y-2"
              style={{
                backgroundColor:
                  accentColor === 'default' && theme === 'light'
                    ? 'rgb(9, 9, 11)'
                    : accentColor === 'default' && theme === 'dark'
                      ? 'rgb(250, 250, 250)'
                      : `rgb(${accentColorValues.rgb})`,
              }}
            />
            <div
              className="absolute top-1 right-4 w-1 h-1 rounded-full opacity-0 transition-transform duration-75 group-hover:opacity-100 group-hover:-translate-y-3"
              style={{
                backgroundColor:
                  accentColor === 'default' && theme === 'light'
                    ? 'rgb(9, 9, 11)'
                    : accentColor === 'default' && theme === 'dark'
                      ? 'rgb(250, 250, 250)'
                      : `rgb(${accentColorValues.rgb})`,
              }}
            />
            <div
              className="absolute top-2 left-2 w-0.75 h-0.75 rounded-full opacity-0 transition-transform duration-75 group-hover:opacity-100 group-hover:-translate-y-2"
              style={{
                backgroundColor:
                  accentColor === 'default' && theme === 'light'
                    ? 'rgb(9, 9, 11)'
                    : accentColor === 'default' && theme === 'dark'
                      ? 'rgb(250, 250, 250)'
                      : `rgb(${accentColorValues.rgb})`,
              }}
            />
            <div
              className="absolute top-2 right-2 w-0.75 h-0.75 rounded-full opacity-0 transition-transform duration-75 group-hover:opacity-100 group-hover:translate-y-4"
              style={{
                backgroundColor:
                  accentColor === 'default' && theme === 'light'
                    ? 'rgb(9, 9, 11)'
                    : accentColor === 'default' && theme === 'dark'
                      ? 'rgb(250, 250, 250)'
                      : `rgb(${accentColorValues.rgb})`,
              }}
            />
            <div
              className="absolute bottom-1 left-4 w-1 h-1 rounded-full opacity-0 transition-transform duration-75 group-hover:opacity-100 group-hover:translate-y-2"
              style={{
                backgroundColor:
                  accentColor === 'default' && theme === 'light'
                    ? 'rgb(9, 9, 11)'
                    : accentColor === 'default' && theme === 'dark'
                      ? 'rgb(250, 250, 250)'
                      : `rgb(${accentColorValues.rgb})`,
              }}
            />
            <div
              className="absolute bottom-1 right-4 w-1 h-1 rounded-full opacity-0 transition-transform duration-75 group-hover:opacity-100 group-hover:translate-y-2"
              style={{
                backgroundColor:
                  accentColor === 'default' && theme === 'light'
                    ? 'rgb(9, 9, 11)'
                    : accentColor === 'default' && theme === 'dark'
                      ? 'rgb(250, 250, 250)'
                      : `rgb(${accentColorValues.rgb})`,
              }}
            />
            <div
              className="absolute top-1.5 left-7 w-1 h-1 rounded-full opacity-0 transition-transform duration-75 group-hover:opacity-100 group-hover:translate-y-6"
              style={{
                backgroundColor:
                  accentColor === 'default' && theme === 'light'
                    ? 'rgb(9, 9, 11)'
                    : accentColor === 'default' && theme === 'dark'
                      ? 'rgb(250, 250, 250)'
                      : `rgb(${accentColorValues.rgb})`,
              }}
            />
            <span
              className="font-bold text-xl text-zinc-950 dark:text-zinc-50 tracking-tight"
              style={{ fontFamily: "'Outfit Variable', sans-serif" }}
            >
              nohonu
            </span>
          </Link>
          <div className="hidden sm:flex items-center h-full ml-5">
            {username && (
              <NavButton to={`/u/${username}`} label="Profile" isActive={location.pathname === `/u/${username}`} />
            )}
            <NavButton to="/docs" label="Docs" isActive={location.pathname === '/docs'} />
          </div>
        </div>
        <div className="flex items-center gap-2 h-full">
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
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400"
                      >
                        <ChevronLeft className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        Settings
                      </button>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                      <button
                        type="button"
                        onClick={() => setMenuView('theme')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
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
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
                      >
                        <Languages className="w-4 h-4" />
                        <span>Language</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuView('font')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
                      >
                        <Type className="w-4 h-4" />
                        <span>Font</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuView('accent')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
                      >
                        <Palette className="w-4 h-4" />
                        <span>Accent Color</span>
                      </button>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                      <Link
                        to="/settings"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMenuView('main');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                      <Link
                        to="/legal"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMenuView('main');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
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
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
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
          {!username && (
            <div className="items-center gap-3 h-9 hidden sm:flex">
              <Link
                to="/login"
                className="px-4 h-full rounded-full text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-950 cursor-pointer border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center"
              >
                Log in
              </Link>
              <Link to="/signup" className={`${buttonBaseClass} ${accentColorValues.bg}`}>
                Sign up
              </Link>
            </div>
          )}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full shrink-0 cursor-pointer select-none"
            >
              {profilePicture && username ? (
                <img
                  src={`${apiBase}/users/${username}/profile-picture`}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700">
                  <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </div>
              )}
            </div>
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-0.5 z-50 bg-zinc-50 dark:bg-zinc-950 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-2 w-[256px] max-h-[80vh] overflow-y-auto dropdown-animate">
                {username && (
                  <>
                    <div className="flex items-start gap-2 px-3 py-2 mb-1">
                      {profilePicture && username ? (
                        <img
                          src={`${apiBase}/users/${username}/profile-picture`}
                          alt={userName}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{userName}</span>
                        {username && (
                          <span className="text-sm text-zinc-500 dark:text-zinc-400 -mt-1">@{username}</span>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                  </>
                )}
                <div className="flex flex-col gap-0.5">
                  {profileOptions.map(({ route, label, divider, icon: Icon }) => (
                    <React.Fragment key={route}>
                      <Link
                        {...(route.includes('$') ? { to: route, params: { username } } : { to: route })}
                        onClick={() => {
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{label}</span>
                      </Link>
                      {divider && <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />}
                    </React.Fragment>
                  ))}
                  {username ? (
                    <>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          disconnect();
                          setIsProfileOpen(false);
                          navigate({ to: '/' });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                      <Link
                        to="/login"
                        onClick={() => {
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Log in</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
