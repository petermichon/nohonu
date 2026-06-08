import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DesktopNavigation, MobileNavigation } from './components/Navigation.tsx';
import { TopBar } from './components/TopBar.tsx';
import { ToastProvider } from './lib/ToastContext.tsx';
import { GlobalToast } from './components/GlobalToast.tsx';
import { LanguageProvider } from './lib/LanguageProvider.tsx';
import { FontProvider } from './lib/FontProvider.tsx';
import { SidebarProvider, useSidebar } from './lib/SidebarProvider.tsx';
import { SitesProvider } from './lib/SitesProvider.tsx';
import { Menu } from 'lucide-react';
import { Logo } from './components/Logo.tsx';
import Home from './pages/Home.tsx';
import Sites from './pages/Sites.tsx';
import Domains from './pages/Domains.tsx';
import Servers from './pages/Servers.tsx';
import SitePage from './pages/SitePage.tsx';
import AccountPage from './pages/Account.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import TermsOfService from './pages/TermsOfService.tsx';
import Legal from './pages/Legal.tsx';
import CopyrightPolicy from './pages/CopyrightPolicy.tsx';
import MentionsLegales from './pages/MentionsLegales.tsx';

function AppContent() {
  const { isCollapsed, isMobileOpen, closeMobileSidebar, toggleSidebar } = useSidebar();

  return (
    <Router>
      <div className="min-h-screen flex bg-stone-50 dark:bg-stone-950">
        {/* Desktop Sidebar - Full height on left */}
        <aside
          className={`hidden md:flex flex-col shrink-0 border-r border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 fixed left-0 top-0 bottom-0 overflow-hidden z-20 ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="h-14 border-b border-stone-200 dark:border-stone-800 flex items-center p-2 gap-2">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex items-center justify-center gap-3 w-10 h-10 rounded-lg text-sm font-medium cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="w-4 h-4 shrink-0" />
            </button>
            {!isCollapsed && (
              <Link to="/" className="flex items-center gap-2">
                <Logo />
                <span className="font-bold text-xl text-stone-900 dark:text-stone-100 tracking-tight">Nohonu</span>
              </Link>
            )}
          </div>
          <nav className="flex-1 p-2 overflow-y-auto">
            <DesktopNavigation isCollapsed={isCollapsed} />
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-70 md:hidden" onClick={closeMobileSidebar} />
            <aside className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-stone-50 dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800 z-80 flex flex-col">
              <div className="h-14 border-b border-stone-200 dark:border-stone-800 flex items-center p-2 gap-2">
                <button
                  type="button"
                  onClick={closeMobileSidebar}
                  className="flex items-center justify-center gap-3 w-10 h-10 rounded-lg text-sm font-medium cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
                  title="Close sidebar"
                >
                  <Menu className="w-4 h-4 shrink-0" />
                </button>
                <Link to="/" className="flex items-center gap-2">
                  <Logo />
                  <span className="font-bold text-xl text-stone-900 dark:text-stone-100 tracking-tight">Nohonu</span>
                </Link>
              </div>
              <nav className="flex-1 p-2 overflow-y-auto">
                <DesktopNavigation isCollapsed={false} />
              </nav>
            </aside>
          </>
        )}

        {/* Main Content Area - To the right of sidebar */}
        <div className={`flex-1 flex flex-col min-w-0 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          {/* Top Bar */}
          <TopBar />

          {/* Page Content */}
          <div className="flex-1">
            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12 pb-20 sm:pb-12 md:pb-12">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sites" element={<Sites />} />
                <Route path="/sites/:domain" element={<SitePage />} />
                <Route path="/domains" element={<Domains />} />
                <Route path="/servers" element={<Servers />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/legal/terms-of-service" element={<TermsOfService />} />
                <Route path="/legal/copyright-policy" element={<CopyrightPolicy />} />
                <Route path="/legal/mentions-legales" element={<MentionsLegales />} />
              </Routes>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNavigation />
        </div>
      </div>
      <GlobalToast />
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <FontProvider>
        <SidebarProvider>
          <SitesProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </SitesProvider>
        </SidebarProvider>
      </FontProvider>
    </LanguageProvider>
  );
}

export default App;
