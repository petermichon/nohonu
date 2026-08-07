import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { ErrorBoundary } from './ErrorBoundary.tsx';

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
