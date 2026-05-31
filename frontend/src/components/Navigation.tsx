import { Link, useLocation } from 'react-router-dom';
import { Rocket, Globe, Server } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/sites', label: 'Sites', Icon: Rocket },
  { to: '/domains', label: 'Domains', Icon: Globe },
  { to: '/servers', label: 'Servers', Icon: Server },
];

function useIsActive() {
  const location = useLocation();
  return (path: string) => location.pathname === path || (path === '/sites' && location.pathname.startsWith('/sites/'));
}

export function DesktopNavigation() {
  const isActive = useIsActive();
  return (
    <div className="flex flex-col">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
            isActive(to)
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
}

export function MobileNavigation() {
  const isActive = useIsActive();
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 z-50">
      <div className="flex items-center">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center py-3 ${
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
