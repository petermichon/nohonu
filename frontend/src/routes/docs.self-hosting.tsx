import { createFileRoute } from '@tanstack/react-router';
import DocsSelfHosting from '../pages/DocsSelfHosting';

export const Route = createFileRoute('/docs/self-hosting')({
  component: DocsSelfHosting,
});
