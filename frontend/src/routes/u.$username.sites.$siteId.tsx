import { createFileRoute } from '@tanstack/react-router';
import { SiteShell } from '../components/sitepage/SiteShell.tsx';

export const Route = createFileRoute('/u/$username/sites/$siteId')({
  component: SiteShell,
});
