import { createFileRoute } from '@tanstack/react-router';
import PrivacyPolicy from '../pages/PrivacyPolicy';

export const Route = createFileRoute('/legal/privacy-policy')({
  component: PrivacyPolicy,
});
