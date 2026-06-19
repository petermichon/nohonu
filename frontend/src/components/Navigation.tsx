import { Link, useLocation } from 'react-router-dom';
import { Rocket, ChevronRight } from 'lucide-react';
import { useState, useLayoutEffect, useRef } from 'react';
import { useApi } from '../lib/api.ts';
import { useSites } from '../lib/SitesProvider.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { SectionNav } from './SectionNav.tsx';
import { NavButton } from './NavButton.tsx';
import { SidebarView } from './SidebarView.tsx';
import { NavItems } from './NavItems.tsx';
import { SIDEBAR_ROUTES, MAIN_NAV_ITEMS, MOBILE_NAV_ITEMS, type SidebarRouteConfig } from '../lib/sidebarConfig.tsx';

function useIsActive() {
  const location = useLocation();
  return (path: string) =>
    location.pathname === path ||
    (path === '/sites' && location.pathname.startsWith('/sites/')) ||
    (path.startsWith('/u/') && location.pathname.startsWith(path));
}

export function DesktopNavigation({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const location = useLocation();
  const isActive = useIsActive();
  const { apiBase } = useApi();
  const { sites, loading } = useSites();
  const { username } = useConnection();
  const [iconErrors, setIconErrors] = useState<Set<string>>(new Set());
  const [animationKey, setAnimationKey] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');
  const previousPathRef = useRef(location.pathname);

  // Derive active route from config
  const activeRoute: SidebarRouteConfig | undefined = SIDEBAR_ROUTES.find((route) => {
    if (route.matchPrefix) {
      return location.pathname.startsWith(route.path);
    }
    return location.pathname === route.path;
  });

  const previousRoutePathRef = useRef(activeRoute?.path);

  // useLayoutEffect fires before paint, preventing the one-frame flash
  // that useEffect would cause when the sidebar view changes
  useLayoutEffect(() => {
    const routeChanged = activeRoute?.path !== previousRoutePathRef.current;
    if (routeChanged) {
      const currentSegments = location.pathname.split('/').filter(Boolean);
      const previousSegments = previousPathRef.current.split('/').filter(Boolean);
      const direction = currentSegments.length > previousSegments.length ? 'left' : 'right';

      setAnimationDirection(direction);
      setAnimationKey((prev) => prev + 1);
    }
    previousPathRef.current = location.pathname;
    previousRoutePathRef.current = activeRoute?.path;
  }, [location.pathname, activeRoute?.path]);

  const handleIconError = (domain: string) => {
    setIconErrors((prev) => new Set(prev).add(domain));
  };

  // Derive breadcrumbs from config or path hierarchy
  const getBreadcrumbs = () => {
    if (activeRoute?.breadcrumbs) {
      return activeRoute.breadcrumbs;
    }

    const segments = [{ label: 'Home', to: '/' }];
    if (location.pathname === '/') return segments;

    const pathParts = location.pathname.split('/').filter(Boolean);
    let currentPath = '';

    const pathSegments = pathParts.map((part) => {
      currentPath += '/' + part;
      const label = part
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, to: currentPath };
    });

    return [...segments, ...pathSegments];
  };

  // Main/home view (no route matched)
  if (!activeRoute) {
    return (
      <>
        <SidebarView
          backTo="/"
          backLabel="Back"
          currentLabel="Home"
          disabled
          animationKey={animationKey}
          animationDirection={animationDirection}
          isCollapsed={isCollapsed}
        >
          <NavItems>
            <NavButton
              to={username ? `/u/${username}` : '/sites'}
              icon={Rocket}
              label="Sites"
              isActive={isActive(username ? `/u/${username}` : '/sites')}
              rightIcon={ChevronRight}
              isCollapsed={isCollapsed}
            />

            {MAIN_NAV_ITEMS.map(({ to, label, icon }) => {
              const targetPath = username ? `/u/${username}${to}` : to;
              return (
                <NavButton
                  key={to}
                  to={targetPath}
                  icon={icon}
                  label={label}
                  isActive={isActive(targetPath)}
                  rightIcon={ChevronRight}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </NavItems>
        </SidebarView>
      </>
    );
  }

  // Render breadcrumbs if configured
  const breadcrumbs = getBreadcrumbs();
  const breadcrumbElement = activeRoute.showBreadcrumbs ? (
    <div className="px-3 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
      {breadcrumbs.map((segment, index) => (
        <span key={segment.to}>
          {index > 0 && ' / '}
          <Link to={segment.to} className="hover:text-stone-600 dark:hover:text-stone-300">
            {segment.label}
          </Link>
        </span>
      ))}
    </div>
  ) : null;

  // Render content based on config
  const renderContent = () => {
    if (activeRoute.renderSiteList) {
      return (
        <>
          {loading ? (
            <div className="px-3 py-2 text-sm text-stone-400">Loading sites...</div>
          ) : sites.length === 0 ? (
            <div className="px-3 py-2 text-sm text-stone-400">No sites</div>
          ) : (
            sites.map((site) => (
              <NavButton
                key={site.domain}
                to={`/sites/${site.domain}`}
                label={site.domain}
                iconUrl={`${apiBase}/sites/${site.domain}/icon`}
                hasIconError={iconErrors.has(site.domain)}
                iconEnabled={site.enabled}
                isActive={location.pathname === `/sites/${site.domain}`}
                onIconError={() => handleIconError(site.domain)}
                rightIcon={ChevronRight}
                isCollapsed={isCollapsed}
              />
            ))
          )}
        </>
      );
    }

    if (activeRoute.sections) {
      return <SectionNav onNavigate={() => {}} isCollapsed={isCollapsed} sections={activeRoute.sections} />;
    }

    if (activeRoute.children) {
      return activeRoute.children.map((child) => (
        <NavButton
          key={child.to}
          to={child.to}
          icon={child.icon}
          label={child.label}
          rightIcon={child.rightIcon}
          isCollapsed={isCollapsed}
        />
      ));
    }

    return <div className="px-3 py-2 text-sm text-stone-400">No sections</div>;
  };

  return (
    <SidebarView
      backTo={activeRoute.backTo}
      backLabel={activeRoute.backLabel}
      currentLabel={activeRoute.currentLabel}
      showBackButton={activeRoute.showBackButton}
      disabled={activeRoute.disabled}
      animationKey={animationKey}
      animationDirection={animationDirection}
      isCollapsed={isCollapsed}
      breadcrumbs={breadcrumbElement}
    >
      <NavItems>{renderContent()}</NavItems>
    </SidebarView>
  );
}

export function MobileNavigation() {
  const isActive = useIsActive();
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 z-50">
      <div className="flex items-center">
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center py-2.5 ${
              isActive(to)
                ? 'text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            {Icon && <Icon className="w-5 h-5" />}
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
