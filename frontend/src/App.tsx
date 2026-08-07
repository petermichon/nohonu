import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
