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

function AppInner() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {/* Top Bar */}
      {isAuthPage ? null : <TopBar />}

      {/* Page Content */}
      <div className="flex-1">
        <div className={isAuthPage ? '' : 'max-w-7xl mx-auto'}>
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
    </>
  );
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
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
