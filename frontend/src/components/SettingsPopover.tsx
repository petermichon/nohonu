import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useClickOutside } from '../lib/useClickOutside.ts';

const keyStatusMsg: Record<'idle' | 'checking' | 'valid' | 'invalid' | 'open', string | null> = {
  idle: null,
  checking: null,
  valid: null,
  invalid: 'Invalid API key',
  open: null,
};

export function SettingsPopover() {
  const { apiBase, apiKey, setApiKey } = useConnection();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(apiKey);
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

  const saveKey = async () => {
    setKeyStatus('checking');
    const base = apiBase.replace(/\/$/, '');
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
          setKey(apiKey);
          setKeyStatus('idle');
          setOpen((o) => !o);
        }}
        className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
        title="Connection settings"
      >
        <Settings className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg p-4 z-50">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            Connection
          </p>
          <div className="grid gap-3">
            <div>
              <label htmlFor="popoverApiKey" className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">
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
                  className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                <button
                  type="button"
                  onClick={saveKey}
                  disabled={keyStatus === 'checking'}
                  className="px-3 py-2 text-xs bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-zinc-950 rounded-lg cursor-pointer disabled:cursor-auto"
                >
                  {keyStatus === 'checking' ? '…' : keyStatus === 'valid' || keyStatus === 'open' ? '✓' : 'Save'}
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
      )}
    </div>
  );
}
