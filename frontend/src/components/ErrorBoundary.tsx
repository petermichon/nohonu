import { Component, type ReactNode } from 'react';

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
      // Reload page on React corruption (HMR issue)
      if (this.state.error?.message?.includes('React') || this.state.error?.message?.includes('hook')) {
        window.location.reload();
        return null;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100 mb-4">Something went wrong</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
