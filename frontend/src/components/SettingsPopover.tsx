import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useClickOutside } from '../lib/useClickOutside.ts';

const urlStatusMsg: Record<'idle' | 'checking' | 'valid' | 'unreachable', string | null> = {
  idle: null,
  checking: null,
  valid: null,
  unreachable: 'Cannot reach server',
};

const keyStatusMsg: Record<'idle' | 'checking' | 'valid' | 'invalid' | 'open', string | null> = {
  idle: null,
  checking: null,
  valid: null,
  invalid: 'Invalid API key',
  open: null,
};

export function SettingsPopover() {
  const { apiBase, apiKey, setApiBase, setApiKey } = useConnection();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(apiBase);
  const [key, setKey] = useState(apiKey);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'valid' | 'unreachable'>('idle');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'open'>('idle');
  const [isServerOpen, setIsServerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

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
        setTimeout(() => {
          setKeyStatus('idle');
          setOpen(false);
        }, 1200);
      } else {
        setIsServerOpen(false);
        if (res.ok) {
          setApiKey(key);
          setKeyStatus('valid');
          setTimeout(() => {
            setKeyStatus('idle');
            setOpen(false);
          }, 800);
        } else {
          setKeyStatus('invalid');
        }
      }
    } catch {
      setKeyStatus('invalid');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setUrl(apiBase);
          setKey(apiKey);
          setUrlStatus('idle');
          setKeyStatus('idle');
          setOpen((o) => !o);
        }}
        className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
        title="Connection settings"
      >
        <Settings className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg p-4 z-50">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">
            Connection
          </p>
          <div className="grid gap-3">
            <div>
              <label htmlFor="popoverApiUrl" className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                API URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="popoverApiUrl"
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
                  className="px-3 py-2 text-xs bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-stone-900 rounded-lg cursor-pointer disabled:cursor-auto"
                >
                  {urlStatus === 'checking' ? '…' : urlStatus === 'valid' ? '✓' : 'Save'}
                </button>
              </div>
              {urlStatusMsg[urlStatus] && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{urlStatusMsg[urlStatus]}</p>
              )}
            </div>
            <div>
              <label htmlFor="popoverApiKey" className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  id="popoverApiKey"
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
                  className="px-3 py-2 text-xs bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-stone-900 rounded-lg cursor-pointer disabled:cursor-auto"
                >
                  {keyStatus === 'checking' ? '…' : keyStatus === 'valid' || keyStatus === 'open' ? '✓' : 'Save'}
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
        </div>
      )}
    </div>
  );
}
