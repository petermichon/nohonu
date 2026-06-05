import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DesktopNavigation, MobileNavigation } from './components/Navigation.tsx';
import { TopBar } from './components/TopBar.tsx';
import { ToastProvider } from './lib/ToastContext.tsx';
import { GlobalToast } from './components/GlobalToast.tsx';
import { LanguageProvider } from './lib/LanguageProvider.tsx';
import { FontProvider } from './lib/FontProvider.tsx';
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
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 fixed left-0 top-14 bottom-0 overflow-hidden">
            <nav className="flex-1 p-2 overflow-y-auto">
              <DesktopNavigation />
            </nav>
          </aside>

          {/* Page Content */}
          <div className="flex-1 flex flex-col min-w-0 md:ml-64">
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
      </div>
      <GlobalToast />
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <FontProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </FontProvider>
    </LanguageProvider>
  );
}

export default App;
