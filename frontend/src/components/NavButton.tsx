import { Link } from 'react-router-dom';

interface NavButtonProps {
  to?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  rightIcon?: React.ComponentType<{ className?: string }>;
  iconUrl?: string;
  hasIconError?: boolean;
  iconEnabled?: boolean;
  onIconError?: () => void;
  isCollapsed?: boolean;
}

export function NavButton({
  to,
  onClick,
  icon: Icon,
  label,
  isActive = false,
  rightIcon: RightIcon,
  iconUrl,
  hasIconError = false,
  iconEnabled = true,
  onIconError,
  isCollapsed = false,
}: NavButtonProps) {
  const className = `flex items-center justify-between gap-3 px-3 rounded-lg text-sm font-medium cursor-pointer ${
    isActive
      ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
  } ${isCollapsed ? 'flex-col justify-center py-3 gap-1' : ''}`;

  const renderIcon = () => {
    if (iconUrl) {
      const initial = label[0].toUpperCase();
      return (
        <div
          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 overflow-hidden ${
            iconEnabled ? 'bg-stone-100 dark:bg-stone-800' : 'bg-stone-100 dark:bg-stone-800/60'
          }`}
        >
          {!hasIconError ? (
            <img src={iconUrl} alt="" className="w-3 h-3 object-contain" onError={onIconError} />
          ) : (
            <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">{initial}</span>
          )}
        </div>
      );
    }
    if (Icon) {
      return <Icon className="w-4 h-4 shrink-0" />;
    }
    return null;
  };

  if (to) {
    return (
      <Link to={to} className={className}>
        {isCollapsed ? (
          <>
            {renderIcon()}
            <span className="text-[10px] text-center leading-tight">{label}</span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 py-2">
              {renderIcon()}
              <span>{label}</span>
            </div>
            {RightIcon && (
              <div className="py-2">
                <RightIcon className="w-4 h-4 shrink-0" />
              </div>
            )}
          </>
        )}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {isCollapsed ? (
        <>
          {renderIcon()}
          <span className="text-[10px] text-center leading-tight">{label}</span>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 py-2">
            {renderIcon()}
            <span>{label}</span>
          </div>
          {RightIcon && (
            <div className="py-2">
              <RightIcon className="w-4 h-4 shrink-0" />
            </div>
          )}
        </>
      )}
    </button>
  );
}
