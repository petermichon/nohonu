export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="16"
        className="fill-zinc-900 dark:fill-indigo-500"
      />
      <rect x="13" y="14" width="6" height="21" rx="3" className="fill-white" />
      <path
        d="M33 14 v8 a9 9 0 0 1 -9 9 h-5"
        className="stroke-white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="36" cy="10" r="4.5" className="fill-indigo-500 dark:fill-white" />
    </svg>
  );
}
