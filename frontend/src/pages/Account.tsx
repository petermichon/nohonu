import { User, Key, Server } from 'lucide-react';
import { Section } from '../components/Section.tsx';
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
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6">Account</h1>

      <Section id="profile" icon={User} title="Profile">
        <p className="text-sm text-stone-500 dark:text-stone-400">Account management is not yet available.</p>
      </Section>

      <Section id="security" icon={Key} title="Security">
        <p className="text-sm text-stone-500 dark:text-stone-400">Security settings are not yet available.</p>
      </Section>

      <Section id="connection" icon={Server} title="Connection">
        <div className="grid gap-4 max-w-md">
          <div>
            <label htmlFor="apiUrl" className="text-sm text-stone-600 dark:text-stone-400 mb-1.5 block">
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
                className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="button"
                onClick={saveUrl}
                disabled={urlStatus === 'checking'}
                className="px-4 py-2 text-sm bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-stone-900 font-medium rounded-lg cursor-pointer disabled:cursor-auto"
              >
                {urlStatus === 'checking' ? 'Checking…' : urlStatus === 'valid' ? 'Saved' : 'Save'}
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setUrl('https://localhost/api');
                  setUrlStatus('idle');
                }}
                className="px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md cursor-pointer"
              >
                localhost
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrl('http://localhost:8080');
                  setUrlStatus('idle');
                }}
                className="px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md cursor-pointer"
              >
                localhost:8080
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrl('https://nohonu.com');
                  setUrlStatus('idle');
                }}
                className="px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md cursor-pointer"
              >
                nohonu.com
              </button>
            </div>
            {urlStatusMsg[urlStatus] && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">{urlStatusMsg[urlStatus]}</p>
            )}
          </div>
          <div>
            <label htmlFor="apiKey" className="text-sm text-stone-600 dark:text-stone-400 mb-1.5 block">
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
                className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="button"
                onClick={saveKey}
                disabled={keyStatus === 'checking'}
                className="px-4 py-2 text-sm bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-stone-900 font-medium rounded-lg cursor-pointer disabled:cursor-auto"
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
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Server has no API key — open access</p>
            )}
            {!isServerOpen && apiBase && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Server requires an API key</p>
            )}
          </div>
        </div>
      </Section>

      <div className="min-h-[50vh]" />
    </div>
  );
}
