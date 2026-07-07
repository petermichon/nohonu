import { createFileRoute } from '@tanstack/react-router';
import MentionsLegales from '../pages/MentionsLegales';

export const Route = createFileRoute('/legal/legal-notice')({
  component: MentionsLegales,
});
