import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Logo } from './components/Logo.tsx';
import { DesktopNavigation, MobileNavigation } from './components/Navigation.tsx';
import { Settings } from 'lucide-react';
import { ToastProvider } from './lib/ToastContext.tsx';
import { GlobalToast } from './components/GlobalToast.tsx';
import Home from './pages/Home.tsx';
import Sites from './pages/Sites.tsx';
import Domains from './pages/Domains.tsx';
import Servers from './pages/Servers.tsx';
import SitePage from './pages/SitePage.tsx';
import SettingsPage from './pages/Settings.tsx';
import AboutUs from './pages/AboutUs.tsx';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen flex bg-stone-50 dark:bg-stone-950">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0 overflow-hidden z-40">
            <div className="h-14 px-4 shrink-0 flex items-center border-b border-stone-200 dark:border-stone-800">
              <Link to="/" className="flex items-center gap-3">
                <Logo />
                <span className="text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Nohonu</span>
              </Link>
            </div>
            <nav className="flex-1 p-2 overflow-hidden">
              <DesktopNavigation />
            </nav>
            <div className="p-2 border-t border-stone-200 dark:border-stone-800 shrink-0">
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 md:ml-64">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0 z-50">
              <div className="px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                  <Logo />
                  <span className="text-base font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                    Nohonu
                  </span>
                </Link>
                <div className="flex items-center gap-2" />
              </div>
            </div>

            {/* Page Content */}
            <div className="flex-1">
              <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12 pb-20 sm:pb-12 md:pb-12">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/sites" element={<Sites />} />
                  <Route path="/sites/:domain" element={<SitePage />} />
                  <Route path="/domains" element={<Domains />} />
                  <Route path="/servers" element={<Servers />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/about" element={<AboutUs />} />
                </Routes>
              </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileNavigation />
          </div>
        </div>
        <GlobalToast />
      </Router>
    </ToastProvider>
  );
}

export default App;
