import { createFileRoute } from '@tanstack/react-router';
import SitePage from '../pages/SitePage';

export const Route = createFileRoute('/u/$username/$sitename/')({
  component: SitePage,
});
