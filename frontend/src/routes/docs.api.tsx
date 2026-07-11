import { createFileRoute } from '@tanstack/react-router';
import DocsApi from '../pages/DocsApi';

export const Route = createFileRoute('/docs/api')({
  component: DocsApi,
});
