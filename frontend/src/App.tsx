import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { TopBar } from './components/TopBar.tsx';
import { ToastProvider } from './lib/ToastContext.tsx';
import { GlobalToast } from './components/GlobalToast.tsx';
import { LanguageProvider } from './lib/LanguageProvider.tsx';
import { FontProvider } from './lib/FontProvider.tsx';
import { SitesProvider } from './lib/SitesProvider.tsx';
import Home from './pages/Home.tsx';
import Explore from './pages/Explore.tsx';
import Sites from './pages/Sites.tsx';
import Domains from './pages/Domains.tsx';
import DomainExplore from './pages/DomainExplore.tsx';
import Servers from './pages/Servers.tsx';
import SitePage from './pages/SitePage.tsx';
import AccountPage from './pages/Account.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import TermsOfService from './pages/TermsOfService.tsx';
import Legal from './pages/Legal.tsx';
import CopyrightPolicy from './pages/CopyrightPolicy.tsx';
import MentionsLegales from './pages/MentionsLegales.tsx';
import UserPage from './pages/UserPage.tsx';
import Docs from './pages/Docs.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import { useState } from 'react';

function useScrollbarWidth() {
  const getScrollbarWidth = () => {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const width = outer.offsetWidth - inner.offsetWidth;
    document.body.removeChild(outer);

    return width;
  };

  const [scrollbarWidth] = useState(() => getScrollbarWidth());
  return scrollbarWidth;
}

function AppInner() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const scrollbarWidth = useScrollbarWidth();

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Top Bar - absolute positioned to sit on top of scrolling content */}
      {isAuthPage ? null : (
        <div className="absolute top-0 left-0 z-50" style={{ right: `${scrollbarWidth}px` }}>
          <TopBar />
        </div>
      )}

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className={isAuthPage ? '' : 'max-w-7xl mx-auto pt-20'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/explore"
              element={
                <SitesProvider>
                  <Explore />
                </SitesProvider>
              }
            />
            <Route
              path="/sites"
              element={
                <SitesProvider>
                  <Sites />
                </SitesProvider>
              }
            />
            <Route
              path="/sites/:domain"
              element={
                <SitesProvider>
                  <SitePage />
                </SitesProvider>
              }
            />
            <Route
              path="/u/:username/:sitename"
              element={
                <SitesProvider>
                  <SitePage />
                </SitesProvider>
              }
            />
            <Route path="/u/:username/domains" element={<Domains />} />
            <Route path="/u/:username/domains/explore" element={<DomainExplore />} />
            <Route path="/u/:username/servers" element={<Servers />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/domains/explore" element={<DomainExplore />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/legal/terms-of-service" element={<TermsOfService />} />
            <Route path="/legal/copyright-policy" element={<CopyrightPolicy />} />
            <Route path="/legal/mentions-legales" element={<MentionsLegales />} />
            <Route
              path="/u/:username"
              element={
                <SitesProvider>
                  <UserPage />
                </SitesProvider>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AppInner />
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
