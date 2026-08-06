import { Fragment, useEffect, useRef, useState, type ComponentType } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { User, Layout, Star, Globe, Settings, LogOut, LogIn } from 'lucide-react';
import { useLogout, useApi } from '../../lib/api.ts';
import { useConnection } from '../../lib/ConnectionProvider.tsx';

interface ProfileOption {
  route: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  divider?: boolean;
}

const MENU_LINK_CLASS =
  'w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50';

export function ProfileMenu() {
  const { displayName, username, disconnect, profilePicture } = useConnection();
  const { apiBase } = useApi();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userName = displayName || username || 'Connect';

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileOptions: ProfileOption[] = username
    ? [
        { route: '/u/$username', label: 'Profile', icon: User, divider: false },
        { route: '/u/$username/sites', label: 'Sites', icon: Layout, divider: false },
        { route: '/u/$username/stars', label: 'Stars', icon: Star, divider: false },
        { route: '/u/$username/domains', label: 'Domains', icon: Globe, divider: true },
        { route: '/u/$username/settings', label: 'Settings', icon: Settings, divider: false },
      ]
    : [{ route: '/account', label: 'Settings', icon: Settings, divider: false }];

  const hasProfilePicture = !!profilePicture && !!username;

  return (
    <div className="relative" ref={profileRef}>
      <div
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="w-8 h-8 rounded-full shrink-0 cursor-pointer select-none"
      >
        {hasProfilePicture ? (
          <img
            src={`${apiBase}/users/${username}/profile-picture`}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700">
            <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </div>
        )}
      </div>
      {isProfileOpen && (
        <div className="absolute right-0 top-full mt-0.5 z-50 bg-zinc-50 dark:bg-zinc-950 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-2 w-[256px] max-h-[80vh] overflow-y-auto dropdown-animate">
          {username && (
            <>
              <div className="flex items-start gap-2 px-3 py-2 mb-1">
                {hasProfilePicture ? (
                  <img
                    src={`${apiBase}/users/${username}/profile-picture`}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{userName}</span>
                  {username && <span className="text-sm text-zinc-500 dark:text-zinc-400 -mt-1">@{username}</span>}
                </div>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
            </>
          )}
          <div className="flex flex-col gap-0.5">
            {profileOptions.map(({ route, label, divider, icon: Icon }) => (
              <Fragment key={route}>
                <Link
                  {...(route.includes('$') ? { to: route, params: { username } } : { to: route })}
                  onClick={() => setIsProfileOpen(false)}
                  className={MENU_LINK_CLASS}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{label}</span>
                </Link>
                {divider && <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />}
              </Fragment>
            ))}
            {username ? (
              <>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    disconnect();
                    setIsProfileOpen(false);
                    navigate({ to: '/' });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
                <Link
                  to="/login"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log in</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
