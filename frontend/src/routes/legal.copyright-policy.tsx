import { createFileRoute } from '@tanstack/react-router';
import CopyrightPolicy from '../pages/CopyrightPolicy';

export const Route = createFileRoute('/legal/copyright-policy')({
  component: CopyrightPolicy,
});
