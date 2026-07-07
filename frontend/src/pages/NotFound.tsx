import { Link } from '@tanstack/react-router';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-zinc-200 dark:text-zinc-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Page not found</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 h-[46px] rounded-full text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
          >
            Go home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 h-[46px] rounded-full text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
