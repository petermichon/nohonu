import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { routeTree } from '../routeTree.gen';
import { queryClient } from '../queryClient';

export async function renderWithRouter(initialPath: string) {
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const testRouter = createRouter({ routeTree, history });
  await testRouter.load();
  const utils = render(<RouterProvider router={testRouter} />);
  return {
    ...utils,
    router: testRouter,
    clear: () => queryClient.clear(),
  };
}
