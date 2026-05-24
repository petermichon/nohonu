import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Logo } from './components/Logo';
import { DesktopNavigation, MobileNavigation } from './components/Navigation';
import { SettingsPopover } from './components/SettingsPopover';
import { ThemeToggle } from './components/ThemeToggle';
import Sites from './pages/Sites';
import Domains from './pages/Domains';
import Servers from './pages/Servers';
import SitePage from './pages/SitePage';

function App() {
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
                <ThemeToggle />
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
                <ThemeToggle />
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
