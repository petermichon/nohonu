import { createFileRoute, Outlet, Link, useMatchRoute } from '@tanstack/react-router';

const SECTIONS = [
  { to: '/docs', label: 'Getting Started', exact: true },
  { to: '/docs/custom-domains', label: 'Custom Domains' },
  { to: '/docs/api', label: 'API' },
  { to: '/docs/self-hosting', label: 'Self-Hosting' },
];

function DocsLayout() {
  const matchRoute = useMatchRoute();

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <aside className="float-left w-44">
        <nav className="md:sticky md:top-16 space-y-1">
          {SECTIONS.map((s) => {
            const isActive = s.exact ? matchRoute({ to: s.to, fuzzy: false }) : matchRoute({ to: s.to, fuzzy: true });
            return (
              <Link
                key={s.to}
                to={s.to}
                className={`block text-sm py-1.5 ${
                  isActive
                    ? 'text-zinc-950 dark:text-zinc-100 font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="overflow-hidden pl-8 lg:pl-12">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/docs')({
  component: DocsLayout,
});
