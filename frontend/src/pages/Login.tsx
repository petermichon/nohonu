import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFont, getFontFamily } from '../lib/FontProvider.tsx';

function Login() {
  const { font } = useFont();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col px-6">
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2"
              style={{ fontFamily: getFontFamily(font) }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Sign in to your Nohonu account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 h-[46px] rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 h-[46px] rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-indigo-500 focus:ring-indigo-500"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full h-[46px] rounded-full text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-500/90 cursor-pointer transition-colors"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <footer className="text-center text-sm text-zinc-400 dark:text-zinc-500 h-16 flex items-center justify-center mt-auto">
        <Link to="/legal" className="hover:text-zinc-600 dark:hover:text-zinc-400">
          Legal
        </Link>
        <Link to="/legal/privacy-policy" className="hover:text-zinc-600 dark:hover:text-zinc-400 ml-2">
          Privacy
        </Link>
        <Link to="/legal/terms-of-service" className="hover:text-zinc-600 dark:hover:text-zinc-400 ml-2">
          Terms
        </Link>
      </footer>
    </div>
  );
}

export default Login;
