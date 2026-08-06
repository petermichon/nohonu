import { Link } from '@tanstack/react-router';

interface NavButtonProps {
  to: string;
  label: string;
  isActive: boolean;
}

export function NavButton({ to, label, isActive: active }: NavButtonProps) {
  return (
    <div className="h-full flex items-center group cursor-pointer group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800">
      <Link
        to={to}
        className={`relative flex items-center justify-center gap-2 px-3 h-8 rounded-lg text-sm font-normal ${active ? 'text-zinc-950 dark:text-zinc-50 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800' : 'text-zinc-950 dark:text-zinc-50 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800'}`}
      >
        <span className="invisible">{label}</span>
        <span className="absolute inset-0 flex items-center justify-center">{label}</span>
      </Link>
    </div>
  );
}
