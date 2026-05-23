import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import { Rocket, Globe, Server, Sun, Moon, Settings, Check } from 'lucide-react';
import { useTheme } from './lib/ThemeProvider';
import { useConnection } from './lib/ConnectionProvider';
import Sites from './pages/Sites';
import Domains from './pages/Domains';
import Servers from './pages/Servers';
import SitePage from './pages/SitePage';
import { useState, useRef } from 'react';
import { useClickOutside } from './lib/useClickOutside';

function Logo() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="7"
        fill="currentColor"
        className="text-purple-400"
      />
      {/* Rocket body */}
      <path
        d="M16 7C16 7 12 12 12 17C12 19 13 21 14 22L16 24L18 22C19 21 20 19 20 17C20 12 16 7 16 7Z"
        fill="white"
      />
      {/* Rocket window */}
      <circle cx="16" cy="15" r="2" fill="currentColor" className="text-purple-400" />
      {/* Left fin */}
      <path
        d="M12 17L10 20C10 20 11 21 12 20L13 18"
        fill="white"
        fillOpacity="0.7"
      />
      {/* Right fin */}
      <path
        d="M20 17L22 20C22 20 21 21 20 20L19 18"
        fill="white"
        fillOpacity="0.7"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: '/', label: 'Sites', mobileLabel: 'Sites', Icon: Rocket },
  { to: '/domains', label: 'Domains', mobileLabel: 'Domains', Icon: Globe },
  { to: '/servers', label: 'Servers', mobileLabel: 'Servers', Icon: Server },
];

function useIsActive() {
  const location = useLocation();
  return (path: string) =>
    location.pathname === path || (path === '/' && location.pathname.startsWith('/sites/'));
}

function DesktopNavigation() {
  const isActive = useIsActive();
  return (
    <div className="hidden sm:flex items-center gap-6">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            isActive(to) ? 'text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
}

function MobileNavigation() {
  const isActive = useIsActive();
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 z-50">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ to, mobileLabel, Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
              isActive(to) ? 'text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800' : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{mobileLabel}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SettingsPopover() {
  const { apiBase, apiKey, setConnection } = useConnection();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(apiBase);
  const [key, setKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const save = () => {
    setConnection({ apiBase: url.replace(/\/$/, ''), apiKey: key });
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); }, 800);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setUrl(apiBase); setKey(apiKey); setOpen(o => !o); }}
        className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
        title="Connection settings"
      >
        <Settings className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg p-4 z-50">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">Connection</p>
          <div className="grid gap-3">
            <div>
              <label className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">API URL</label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">API Key</label>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="Leave empty if not set"
                className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors"
              />
            </div>
            <button
              onClick={save}
              className="w-full py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 text-white dark:text-stone-900 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {saved ? <><Check className="w-4 h-4" />Saved</> : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Router>
      <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
        {/* Desktop Top Navigation */}
        <nav className="hidden sm:flex border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0 z-50">
          <div className="px-6 w-full">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Logo />
                  <span className="text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                    Nohonu
                  </span>
                </div>
                <DesktopNavigation />
              </div>
              <div className="flex items-center gap-1">
                <SettingsPopover />
                <button
                  onClick={toggleTheme}
                  className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  title="Toggle theme"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Top Bar - Logo and theme toggle */}
        <nav className="sm:hidden border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0 z-50">
          <div className="px-3">
            <div className="flex items-center h-14 gap-3">
              <div className="flex items-center gap-2">
                <Logo />
                <span className="text-base font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                  Nohonu
                </span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <SettingsPopover />
                <button
                  onClick={toggleTheme}
                  className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  title="Toggle theme"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 overflow-y-scroll themed-scroll">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12 pb-20 sm:pb-12">
            <Routes>
              <Route path="/" element={<Sites />} />
              <Route path="/sites/:domain" element={<SitePage />} />
              <Route path="/domains" element={<Domains />} />
              <Route path="/servers" element={<Servers />} />
            </Routes>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />
      </div>
    </Router>
  );
}

export default App;
