import { useState, useRef } from 'react';
import { Settings, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useClickOutside } from '../lib/useClickOutside.ts';

type AuthStatus = 'idle' | 'checking' | 'valid' | 'open' | 'invalid' | 'unreachable';

const statusMsg: Record<AuthStatus, string | null> = {
  idle: null,
  checking: null,
  valid: null,
  open: 'Server has no API key — open access',
  invalid: 'Invalid API key',
  unreachable: 'Cannot reach server',
};

export function SettingsPopover() {
  const { apiBase, apiKey, setConnection } = useConnection();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(apiBase);
  const [key, setKey] = useState(apiKey);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

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
          setOpen(false);
        }, 1200);
      } else if (res.ok) {
        setConnection({ apiBase: base, apiKey: key });
        setStatus('valid');
        setTimeout(() => {
          setStatus('idle');
          setOpen(false);
        }, 800);
      } else {
        setStatus('invalid');
      }
    } catch {
      setStatus('unreachable');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setUrl(apiBase);
          setKey(apiKey);
          setStatus('idle');
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
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div>
              <label htmlFor="popoverApiUrl" className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                API URL
              </label>
              <input
                type="text"
                id="popoverApiUrl"
                name="apiUrl"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setStatus('idle');
                }}
                placeholder="http://localhost:8080"
                className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label htmlFor="popoverApiKey" className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                API Key
              </label>
              <input
                type="password"
                id="popoverApiKey"
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
                className={`flex items-center gap-1.5 text-xs ${
                  status === 'open' ? 'text-stone-500 dark:text-stone-400' : 'text-red-500 dark:text-red-400'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {statusMsg[status]}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'checking'}
              className="w-full py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-stone-900 text-sm font-medium rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-auto"
            >
              {status === 'checking' && <Loader2 className="w-4 h-4 animate-spin" />}
              {(status === 'valid' || status === 'open') && <Check className="w-4 h-4" />}
              {status === 'checking' ? 'Checking…' : status === 'valid' || status === 'open' ? 'Saved' : 'Save'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
