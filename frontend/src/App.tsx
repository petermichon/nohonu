import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { TopBar } from './components/TopBar.tsx';
import { Footer } from './components/Footer.tsx';
import { ToastProvider } from './lib/ToastContext.tsx';
import { GlobalToast } from './components/GlobalToast.tsx';
import { LanguageProvider } from './lib/LanguageProvider.tsx';
import { FontProvider } from './lib/FontProvider.tsx';
import Home from './pages/Home.tsx';
import Explore from './pages/Explore.tsx';
import DomainExplore from './pages/DomainExplore.tsx';
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
import Deploy from './pages/Deploy.tsx';
import About from './pages/About.tsx';
import NotFound from './pages/NotFound.tsx';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const getTitle = () => {
      const path = location.pathname;
      if (path === '/') return 'Nohonu - Open hosting';
      if (path === '/explore') return 'Explore | Nohonu';
      if (path === '/docs') return 'Docs | Nohonu';
      if (path === '/login') return 'Log in | Nohonu';
      if (path === '/signup') return 'Sign up | Nohonu';
      if (path === '/account') return 'Account | Nohonu';
      if (path === '/legal') return 'Legal | Nohonu';
      if (path.startsWith('/u/')) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 2) return `@${parts[1]} | Nohonu`;
        if (parts.length === 3) return `${parts[2]} | Nohonu`;
        if (parts.length === 4) return `${parts[2]} | Nohonu`;
      }
      return 'Nohonu';
    };
    document.title = getTitle();
  }, [location.pathname]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Top Bar - absolute positioned to sit on top of scrolling content */}
      {isAuthPage ? null : (
        <div className="absolute top-0 left-0 z-50" style={{ right: `${scrollbarWidth}px` }}>
          <TopBar />
        </div>
      )}

      {/* Page Content */}
      <div className="flex-1 overflow-y-scroll min-h-0">
        <div className={isAuthPage ? '' : 'max-w-7xl mx-auto pt-20'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/u/:username/sites" element={<UserPage />} />
            <Route path="/u/:username/domains" element={<UserPage />} />
            <Route path="/u/:username/servers" element={<UserPage />} />
            <Route path="/u/:username" element={<UserPage />} />
            <Route path="/u/:username/:sitename/:section?" element={<SitePage />} />
            <Route path="/u/:username/domains/explore" element={<DomainExplore />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/legal/terms-of-service" element={<TermsOfService />} />
            <Route path="/legal/copyright-policy" element={<CopyrightPolicy />} />
            <Route path="/legal/mentions-legales" element={<MentionsLegales />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {!isAuthPage && <Footer />}
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
