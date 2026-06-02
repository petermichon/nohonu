import { Link } from 'react-router-dom';

interface NavButtonProps {
  to?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  rightIcon?: React.ComponentType<{ className?: string }>;
}

export function NavButton({ to, onClick, icon: Icon, label, isActive = false, rightIcon: RightIcon }: NavButtonProps) {
  const className = `flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
    isActive
      ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
  }`;

  if (to) {
    return (
      <Link to={to} className={className}>
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </div>
        {RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </div>
      {RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
