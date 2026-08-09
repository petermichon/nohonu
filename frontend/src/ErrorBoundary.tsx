import { Component, type ReactNode } from 'react';
import { shouldReloadOnCorruption } from './lib/utils.ts';
import { Button } from './components/Button.tsx';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (shouldReloadOnCorruption(this.state.error)) {
        window.location.reload();
        return null;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100 mb-4">Something went wrong</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">{this.state.error?.message}</p>
            <Button
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
