import { createFileRoute } from '@tanstack/react-router';
import AccountPage from '../pages/Account';

export const Route = createFileRoute('/account')({
  component: AccountPage,
});
