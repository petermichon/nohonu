import { Link, useLocation } from '@tanstack/react-router';
import { Tooltip } from '../Tooltip.tsx';
import { useAccentColor } from '../../providers/AccentColorProvider.tsx';
import { useConnection } from '../../hooks/useConnection.ts';
import { NavButton } from './NavButton.tsx';
import { SettingsMenu } from './SettingsMenu.tsx';
import { ProfileMenu } from './ProfileMenu.tsx';
import { LogoMark } from '../LogoMark.tsx';

export function TopBar() {
  const { username } = useConnection();
  const { getAccentColorValues } = useAccentColor();
  const location = useLocation();
  const accentColorValues = getAccentColorValues();

  const buttonBaseClass = `px-4 h-full rounded-full text-sm font-medium ${
    accentColorValues.textColor === 'light'
      ? 'text-white'
      : accentColorValues.textColor === 'inverted'
        ? 'text-zinc-100 dark:text-zinc-950'
        : 'text-zinc-950'
  } cursor-pointer flex items-center justify-center whitespace-nowrap`;

  return (
    <header className="h-16 shrink-0 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full flex items-center justify-between gap-2 max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center h-full">
          <Link to="/" className="flex items-center gap-2 relative group">
            <LogoMark className="w-7 h-7" />
            <span
              className="font-bold text-xl text-zinc-950 dark:text-zinc-50 tracking-tight"
              style={{ fontFamily: "'Outfit Variable', sans-serif" }}
            >
              nohonu
            </span>
          </Link>
          <Tooltip content="Nohonu is in active development" position="bottom">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 leading-none mt-0.5 ml-1 cursor-default">
              Beta
            </span>
          </Tooltip>
          <div className="hidden sm:flex items-center h-full ml-5">
            {username && (
              <NavButton to={`/u/${username}`} label="Profile" isActive={location.pathname === `/u/${username}`} />
            )}
            <NavButton to="/docs" label="Docs" isActive={location.pathname === '/docs'} />
          </div>
        </div>
        <div className="flex items-center gap-2 h-full">
          <SettingsMenu />
          {!username && (
            <div className="items-center gap-3 h-9 hidden sm:flex">
              <Link
                to="/login"
                className="px-4 h-full rounded-full text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-950 cursor-pointer border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center"
              >
                Log in
              </Link>
              <Link to="/signup" className={`${buttonBaseClass} ${accentColorValues.bg}`}>
                Sign up
              </Link>
            </div>
          )}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
