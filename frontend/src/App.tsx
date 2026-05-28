import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Logo } from './components/Logo.tsx';
import { DesktopNavigation, MobileNavigation } from './components/Navigation.tsx';
import { SettingsPopover } from './components/SettingsPopover.tsx';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import Sites from './pages/Sites.tsx';
import Domains from './pages/Domains.tsx';
import Servers from './pages/Servers.tsx';
import SitePage from './pages/SitePage.tsx';

function App() {
  return (
    <Router>
      <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
        {/* Top Navigation */}
        <nav className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0 z-50">
          <div className="px-3 sm:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Logo />
                  <span className="text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
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
