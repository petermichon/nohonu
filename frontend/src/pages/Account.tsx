import { Server } from 'lucide-react';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useState, useEffect } from 'react';

export default function Account() {
  const { apiBase, apiKey, setApiBase, setApiKey } = useConnection();
  const [url, setUrl] = useState(apiBase);
  const [key, setKey] = useState(apiKey);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'valid' | 'unreachable'>('idle');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'open'>('idle');
  const [isServerOpen, setIsServerOpen] = useState(false);

  useEffect(() => {
    const checkServerSecurity = async () => {
      try {
        const res = await fetch(`${apiBase}/auth`, {
          headers: apiKey ? { 'X-Api-Key': apiKey } : {},
        });
        const data = await res.json().catch(() => ({}));
        setIsServerOpen(!data.secured);
      } catch {
        // Ignore errors on initial load
      }
    };
    checkServerSecurity();
  }, [apiBase, apiKey]);

  const saveUrl = async () => {
    setUrlStatus('checking');
    const base = url.replace(/\/$/, '');
    try {
      const res = await fetch(`${base}/auth`, {
        headers: apiKey ? { 'X-Api-Key': apiKey } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setApiBase(base);
        setIsServerOpen(!data.secured);
        setUrlStatus('valid');
        setTimeout(() => setUrlStatus('idle'), 800);
      } else {
        setUrlStatus('unreachable');
      }
    } catch {
      setUrlStatus('unreachable');
    }
  };

  const saveKey = async () => {
    setKeyStatus('checking');
    const base = url.replace(/\/$/, '');
    try {
      const res = await fetch(`${base}/auth`, {
        headers: key ? { 'X-Api-Key': key } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (!data.secured) {
        setIsServerOpen(true);
        setApiKey(key);
        setKeyStatus('open');
        setTimeout(() => setKeyStatus('idle'), 1200);
      } else {
        setIsServerOpen(false);
        if (res.ok) {
          setApiKey(key);
          setKeyStatus('valid');
          setTimeout(() => setKeyStatus('idle'), 800);
        } else {
          setKeyStatus('invalid');
        }
      }
    } catch {
      setKeyStatus('invalid');
    }
  };

  const urlStatusMsg: Record<typeof urlStatus, string | null> = {
    idle: null,
    checking: null,
    valid: null,
    unreachable: 'Cannot reach server',
  };

  const keyStatusMsg: Record<typeof keyStatus, string | null> = {
    idle: null,
    checking: null,
    valid: null,
    invalid: 'Invalid API key',
    open: null,
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Account</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">Manage your account settings and preferences.</p>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Connection
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="apiUrl" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                API URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="apiUrl"
                  name="apiUrl"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlStatus('idle');
                  }}
                  placeholder="https://localhost/api"
                  className="flex-1 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
                <button
                  type="button"
                  onClick={saveUrl}
                  disabled={urlStatus === 'checking'}
                  className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-950 font-medium rounded-lg cursor-pointer disabled:cursor-auto"
                >
                  {urlStatus === 'checking' ? 'Checking…' : urlStatus === 'valid' ? 'Saved' : 'Save'}
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUrl('http://localhost:8080');
                    setUrlStatus('idle');
                  }}
                  className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md cursor-pointer"
                >
                  http://localhost:8080
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrl('https://localhost/api');
                    setUrlStatus('idle');
                  }}
                  className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md cursor-pointer"
                >
                  https://localhost/api
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrl('https://nohonu.com/api');
                    setUrlStatus('idle');
                  }}
                  className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md cursor-pointer"
                >
                  https://nohonu.com/api
                </button>
              </div>
              {urlStatusMsg[urlStatus] && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{urlStatusMsg[urlStatus]}</p>
              )}
            </div>
            <div>
              <label htmlFor="apiKey" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  autoComplete="off"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setKeyStatus('idle');
                  }}
                  placeholder="Leave empty if not set"
                  className="flex-1 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
                <button
                  type="button"
                  onClick={saveKey}
                  disabled={keyStatus === 'checking'}
                  className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-950 font-medium rounded-lg cursor-pointer disabled:cursor-auto"
                >
                  {keyStatus === 'checking'
                    ? 'Checking…'
                    : keyStatus === 'valid' || keyStatus === 'open'
                      ? 'Saved'
                      : 'Save'}
                </button>
              </div>
              {keyStatusMsg[keyStatus] && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{keyStatusMsg[keyStatus]}</p>
              )}
              {isServerOpen && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Server has no API key — open access</p>
              )}
              {!isServerOpen && apiBase && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Server requires an API key</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
