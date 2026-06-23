import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
            <Link to="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              About
            </Link>
            <Link to="/legal" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Legal
            </Link>
            <Link to="/legal/privacy-policy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Privacy
            </Link>
            <Link
              to="/legal/terms-of-service"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Terms
            </Link>
            <a
              href="https://github.com/nohonu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </a>
            <a
              href="https://opencollective.com/nohonu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.54 0 4.894-.79 6.834-2.135l-3.107-3.109a7.715 7.715 0 1 1 0-13.512l3.107-3.109A11.943 11.943 0 0 0 12 0zm9.865 5.166l-3.109 3.107A7.67 7.67 0 0 1 19.715 12a7.682 7.682 0 0 1-.959 3.727l3.109 3.107A11.943 11.943 0 0 0 24 12c0-2.54-.79-4.894-2.135-6.834z" />
              </svg>
              Open Collective
            </a>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-500">© 2026 Nohonu</div>
        </div>
      </div>
    </footer>
  );
}
