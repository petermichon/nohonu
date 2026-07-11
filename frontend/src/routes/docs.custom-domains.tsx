import { createFileRoute } from '@tanstack/react-router';
import DocsCustomDomains from '../pages/DocsCustomDomains';

export const Route = createFileRoute('/docs/custom-domains')({
  component: DocsCustomDomains,
});
