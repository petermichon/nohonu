import { createFileRoute } from '@tanstack/react-router';
import Deploy from '../pages/Deploy';

export const Route = createFileRoute('/deploy')({
  component: Deploy,
});
