import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useConnection } from '../hooks/useConnection.ts';
import { useClickOutside } from '../hooks/useClickOutside.ts';
import { SaveField } from './SaveField.tsx';
import { Button } from './Button.tsx';

const keyStatusMsg: Record<'idle' | 'checking' | 'valid' | 'invalid' | 'open', string | null> = {
  idle: null,
  checking: null,
  valid: null,
  invalid: 'Invalid server password',
  open: null,
};

export function SettingsPopover() {
  const { apiBase, serverPassword, setServerPassword } = useConnection();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(serverPassword);
  const [keyStatus, setKeyStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'open'>('idle');
  const [isServerOpen, setIsServerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  useEffect(() => {
    const checkServerSecurity = async () => {
      try {
        const res = await fetch(`${apiBase}/auth`, {
          headers: serverPassword ? { 'X-Server-Password': serverPassword } : {},
        });
        const data = await res.json().catch(() => ({}));
        setIsServerOpen(res.ok && !data.secured);
      } catch {
        // Ignore errors on initial load
      }
    };
    checkServerSecurity();
  }, [apiBase, serverPassword]);

  const saveKey = async () => {
    setKeyStatus('checking');
    const base = apiBase.replace(/\/$/, '');
    try {
      const res = await fetch(`${base}/auth`, {
        headers: key ? { 'X-Server-Password': key } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && !data.secured) {
        setIsServerOpen(true);
        setServerPassword(key);
        setKeyStatus('open');
        setTimeout(() => {
          setKeyStatus('idle');
          setOpen(false);
        }, 1200);
      } else {
        setIsServerOpen(false);
        if (res.ok) {
          setServerPassword(key);
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
          setKey(serverPassword);
          setKeyStatus('idle');
          setOpen((o) => !o);
        }}
        className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
        title="Connection settings"
        aria-label="Connection settings"
      >
        <Settings className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg p-4 z-50">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            Connection
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 truncate" title={apiBase}>
            Backend: {apiBase}
          </p>
          <div className="grid gap-3">
            <SaveField
              label="Server password"
              htmlFor="popoverApiKey"
              type="password"
              value={key}
              onChange={(value) => {
                setKey(value);
                setKeyStatus('idle');
              }}
              placeholder="Leave empty if not set"
              autoComplete="off"
              action={
                <Button
                  type="button"
                  onClick={saveKey}
                  disabled={keyStatus === 'checking'}
                  className="px-3 py-2 text-xs bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-zinc-950 rounded-lg cursor-pointer disabled:cursor-auto"
                >
                  {keyStatus === 'checking' ? '…' : keyStatus === 'valid' || keyStatus === 'open' ? '✓' : 'Save'}
                </Button>
              }
              hint={
                <>
                  {keyStatusMsg[keyStatus] && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{keyStatusMsg[keyStatus]}</p>
                  )}
                  {isServerOpen && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Server has no password — open access</p>
                  )}
                  {!isServerOpen && apiBase && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Server requires a password</p>
                  )}
                </>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
