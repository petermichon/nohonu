import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/u/$username/sites')({
  component: () => <Outlet />,
});
