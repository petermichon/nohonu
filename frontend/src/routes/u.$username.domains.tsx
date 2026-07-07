import { createFileRoute } from '@tanstack/react-router';
import UserPage from '../pages/UserPage';

export const Route = createFileRoute('/u/$username/domains')({
  component: UserPage,
});
