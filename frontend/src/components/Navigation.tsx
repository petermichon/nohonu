import { Link, useLocation } from 'react-router-dom';
import { Rocket, Globe, Server, ChevronRight, Palette } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useApi } from '../lib/api.ts';
import { SectionNav } from './SectionNav.tsx';
import { NavButton } from './NavButton.tsx';
import { SidebarView } from './SidebarView.tsx';
import { NavItems } from './NavItems.tsx';
import type { Site } from '../lib/types.ts';

const NAV_ITEMS = [
  { to: '/domains', label: 'Domains', Icon: Globe },
  { to: '/servers', label: 'Servers', Icon: Server },
];

function useIsActive() {
  const location = useLocation();
  return (path: string) => location.pathname === path || (path === '/sites' && location.pathname.startsWith('/sites/'));
}

export function DesktopNavigation() {
  const location = useLocation();
  const isActive = useIsActive();
  const { apiFetch, apiBase } = useApi();
  const [sites, setSites] = useState<Site[]>([]);
  const [view, setView] = useState<'main' | 'sites' | 'site' | 'domains' | 'servers' | 'about'>('main');
  const [loading, setLoading] = useState(true);
  const [iconErrors, setIconErrors] = useState<Set<string>>(new Set());
  const [animationKey, setAnimationKey] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');
  const previousPathRef = useRef(location.pathname);

  const isSitesActive = isActive('/sites');
  const isDomainsActive = isActive('/domains');
  const isServersActive = isActive('/servers');
  const isSiteDetailActive = location.pathname.startsWith('/sites/') && location.pathname !== '/sites';

  // Get current path segments
  const getPathSegments = () => {
    const segments = [{ label: 'Home', to: '/' }];
    if (location.pathname === '/') return segments;
    if (location.pathname === '/sites') return [...segments, { label: 'Sites', to: '/sites' }];
    if (location.pathname.startsWith('/sites/')) {
      const domain = location.pathname.split('/')[2];
      return [...segments, { label: 'Sites', to: '/sites' }, { label: domain, to: `/sites/${domain}` }];
    }
    if (location.pathname === '/domains') return [...segments, { label: 'Domains', to: '/domains' }];
    if (location.pathname === '/servers') return [...segments, { label: 'Servers', to: '/servers' }];
    if (location.pathname === '/settings') return [...segments, { label: 'Settings', to: '/settings' }];
    if (location.pathname === '/about') return [...segments, { label: 'About', to: '/about' }];
    return segments;
  };

  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await apiFetch('/sites');
        const data = await res.json();
        setSites(data.sites || []);
      } catch {
        setSites([]);
      } finally {
        setLoading(false);
      }
    };
    loadSites();
  }, [apiFetch]);

  useEffect(() => {
    // Determine animation direction based on path depth
    const currentSegments = location.pathname.split('/').filter(Boolean);
    const previousSegments = previousPathRef.current.split('/').filter(Boolean);
    const direction = currentSegments.length > previousSegments.length ? 'left' : 'right';

    if (isSiteDetailActive) {
      setView('site');
    } else if (isSitesActive) {
      setView('sites');
    } else if (isDomainsActive) {
      setView('domains');
    } else if (isServersActive) {
      setView('servers');
    } else if (location.pathname === '/about') {
      setView('about');
    } else if (
      !location.pathname.startsWith('/sites') &&
      !location.pathname.startsWith('/domains') &&
      !location.pathname.startsWith('/servers')
    ) {
      setView('main');
    }

    setAnimationDirection(direction);
    setAnimationKey((prev) => prev + 1);
    previousPathRef.current = location.pathname;
  }, [isSiteDetailActive, isSitesActive, isDomainsActive, isServersActive, location.pathname]);

  const handleIconError = (domain: string) => {
    setIconErrors((prev) => new Set(prev).add(domain));
  };

  if (view === 'sites') {
    const pathSegments = getPathSegments();
    return (
      <>
        {/* Current path */}
        <div className="px-3 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {pathSegments.map((segment, index) => (
            <span key={segment.to}>
              {index > 0 && ' / '}
              <Link to={segment.to} className="hover:text-stone-600 dark:hover:text-stone-300">
                {segment.label}
              </Link>
            </span>
          ))}
        </div>

        <SidebarView
          backTo="/"
          backLabel="Home"
          currentLabel="Sites"
          animationKey={animationKey}
          animationDirection={animationDirection}
        >
          <NavItems>
            {loading ? (
              <div className="px-3 py-2 text-sm text-stone-400">Loading sites...</div>
            ) : sites.length === 0 ? (
              <div className="px-3 py-2 text-sm text-stone-400">No sites</div>
            ) : (
              sites.map((site) => {
                const initial = site.domain[0].toUpperCase();
                const hasIconError = iconErrors.has(site.domain);
                return (
                  <Link
                    key={site.domain}
                    to={`/sites/${site.domain}`}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium group ${
                      location.pathname === `/sites/${site.domain}`
                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Favicon */}
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 overflow-hidden ${
                          site.enabled ? 'bg-stone-100 dark:bg-stone-800' : 'bg-stone-100 dark:bg-stone-800/60'
                        }`}
                      >
                        {!hasIconError ? (
                          <img
                            src={`${apiBase}/sites/${site.domain}/icon`}
                            alt=""
                            className="w-3 h-3 object-contain"
                            onError={() => handleIconError(site.domain)}
                          />
                        ) : (
                          <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                            {initial}
                          </span>
                        )}
                      </div>

                      {/* Domain */}
                      <span className="truncate">{site.domain}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </Link>
                );
              })
            )}
          </NavItems>
        </SidebarView>
      </>
    );
  }

  if (view === 'site') {
    const pathSegments = getPathSegments();
    return (
      <>
        {/* Current path */}
        <div className="px-3 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {pathSegments.map((segment, index) => (
            <span key={segment.to}>
              {index > 0 && ' / '}
              <Link to={segment.to} className="hover:text-stone-600 dark:hover:text-stone-300">
                {segment.label}
              </Link>
            </span>
          ))}
        </div>

        <SidebarView
          backTo="/sites"
          backLabel="Sites"
          currentLabel={pathSegments[pathSegments.length - 1].label}
          animationKey={animationKey}
          animationDirection={animationDirection}
        >
          <NavItems>
            <SectionNav onNavigate={() => {}} />
          </NavItems>
        </SidebarView>
      </>
    );
  }

  if (view === 'domains') {
    const pathSegments = getPathSegments();
    return (
      <>
        {/* Current path */}
        <div className="px-3 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {pathSegments.map((segment, index) => (
            <span key={segment.to}>
              {index > 0 && ' / '}
              <Link to={segment.to} className="hover:text-stone-600 dark:hover:text-stone-300">
                {segment.label}
              </Link>
            </span>
          ))}
        </div>

        <SidebarView
          backTo="/"
          backLabel="Home"
          currentLabel="Domains"
          animationKey={animationKey}
          animationDirection={animationDirection}
        >
          <NavItems>
            {/* Empty state */}
            <div className="px-3 py-2 text-sm text-stone-400">No domains</div>
          </NavItems>
        </SidebarView>
      </>
    );
  }

  if (view === 'servers') {
    const pathSegments = getPathSegments();
    return (
      <>
        {/* Current path */}
        <div className="px-3 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {pathSegments.map((segment, index) => (
            <span key={segment.to}>
              {index > 0 && ' / '}
              <Link to={segment.to} className="hover:text-stone-600 dark:hover:text-stone-300">
                {segment.label}
              </Link>
            </span>
          ))}
        </div>

        <SidebarView
          backTo="/"
          backLabel="Home"
          currentLabel="Servers"
          animationKey={animationKey}
          animationDirection={animationDirection}
        >
          <NavItems>
            {/* Empty state */}
            <div className="px-3 py-2 text-sm text-stone-400">No servers</div>
          </NavItems>
        </SidebarView>
      </>
    );
  }

  if (view === 'about') {
    const pathSegments = getPathSegments();
    return (
      <>
        {/* Current path */}
        <div className="px-3 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {pathSegments.map((segment, index) => (
            <span key={segment.to}>
              {index > 0 && ' / '}
              <Link to={segment.to} className="hover:text-stone-600 dark:hover:text-stone-300">
                {segment.label}
              </Link>
            </span>
          ))}
        </div>

        <SidebarView
          backTo="/"
          backLabel="Home"
          currentLabel="About"
          animationKey={animationKey}
          animationDirection={animationDirection}
        >
          <NavItems>
            {/* Empty state */}
            <div className="px-3 py-2 text-sm text-stone-400">No sections</div>
          </NavItems>
        </SidebarView>
      </>
    );
  }

  return (
    <>
      {/* Current path */}
      <div className="px-3 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
        {getPathSegments().map((segment, index) => (
          <span key={segment.to}>
            {index > 0 && ' / '}
            <Link to={segment.to} className="hover:text-stone-600 dark:hover:text-stone-300">
              {segment.label}
            </Link>
          </span>
        ))}
      </div>

      <SidebarView
        backTo="/"
        backLabel="Back"
        currentLabel="Home"
        disabled
        animationKey={animationKey}
        animationDirection={animationDirection}
      >
        <NavItems>
          {/* Sites button */}
          <NavButton to="/sites" icon={Rocket} label="Sites" isActive={isSitesActive} rightIcon={ChevronRight} />

          {/* Other nav items */}
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavButton key={to} to={to} icon={Icon} label={label} isActive={isActive(to)} rightIcon={ChevronRight} />
          ))}
        </NavItems>

        {/* Separator */}
        <div className="border-t border-stone-200 dark:border-stone-800 my-2" />

        {/* About link - separate section */}
        <Link
          to="/about"
          className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
        >
          <div className="flex items-center gap-3">
            <Palette className="w-4 h-4" />
            <span>About</span>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </Link>
      </SidebarView>
    </>
  );
}

export function MobileNavigation() {
  const isActive = useIsActive();
  const MOBILE_NAV_ITEMS = [
    { to: '/sites', label: 'Sites', Icon: Rocket },
    { to: '/domains', label: 'Domains', Icon: Globe },
    { to: '/servers', label: 'Servers', Icon: Server },
  ];
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 z-50">
      <div className="flex items-center">
        {MOBILE_NAV_ITEMS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center py-2.5 ${
              isActive(to)
                ? 'text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
