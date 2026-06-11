import { User, Key, Server, AlertCircle, Loader2, Check } from 'lucide-react';
import { Section } from '../components/Section.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useState } from 'react';

export default function Account() {
  const { apiBase, apiKey, setConnection } = useConnection();
  const [url, setUrl] = useState(apiBase);
  const [key, setKey] = useState(apiKey);
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'open' | 'invalid' | 'unreachable'>('idle');

  const save = async () => {
    setStatus('checking');
    const base = url.replace(/\/$/, '');
    try {
      const res = await fetch(`${base}/auth`, {
        headers: key ? { 'X-Api-Key': key } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (!data.secured) {
        setConnection({ apiBase: base, apiKey: '' });
        setStatus('open');
        setTimeout(() => {
          setStatus('idle');
        }, 1200);
      } else if (res.ok) {
        setConnection({ apiBase: base, apiKey: key });
        setStatus('valid');
        setTimeout(() => {
          setStatus('idle');
        }, 800);
      } else {
        setStatus('invalid');
      }
    } catch {
      setStatus('unreachable');
    }
  };

  const statusMsg: Record<typeof status, string | null> = {
    idle: null,
    checking: null,
    valid: null,
    open: 'Server has no API key — open access',
    invalid: 'Invalid API key',
    unreachable: 'Cannot reach server',
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6">Account</h1>

      <Section id="profile" icon={User} title="Profile">
        <p className="text-sm text-stone-500 dark:text-stone-400">Account management is not yet available.</p>
      </Section>

      <Section id="security" icon={Key} title="Security">
        <p className="text-sm text-stone-500 dark:text-stone-400">Security settings are not yet available.</p>
      </Section>

      <Section id="connection" icon={Server} title="Connection">
        <form
          className="grid gap-4 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div>
            <label htmlFor="apiUrl" className="text-sm text-stone-600 dark:text-stone-400 mb-1.5 block">
              API URL
            </label>
            <input
              type="text"
              id="apiUrl"
              name="apiUrl"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setStatus('idle');
              }}
              placeholder="http://localhost:8080"
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setUrl('http://localhost');
                  setStatus('idle');
                }}
                className="px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md cursor-pointer"
              >
                Localhost
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrl('https://nohonu.com');
                  setStatus('idle');
                }}
                className="px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md cursor-pointer"
              >
                nohonu.com
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="apiKey" className="text-sm text-stone-600 dark:text-stone-400 mb-1.5 block">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              autoComplete="off"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setStatus('idle');
              }}
              placeholder="Leave empty if not set"
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          {statusMsg[status] && (
            <p
              className={`flex items-center gap-1.5 text-sm ${
                status === 'open' ? 'text-stone-500 dark:text-stone-400' : 'text-red-500 dark:text-red-400'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {statusMsg[status]}
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'checking'}
            className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-stone-900 text-sm font-medium rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-auto"
          >
            {status === 'checking' && <Loader2 className="w-4 h-4 animate-spin" />}
            {(status === 'valid' || status === 'open') && <Check className="w-4 h-4" />}
            {status === 'checking' ? 'Checking…' : status === 'valid' || status === 'open' ? 'Saved' : 'Save'}
          </button>
        </form>
      </Section>

      <div className="min-h-[50vh]" />
    </div>
  );
}
