import { Server } from 'lucide-react';
import { useConnection } from '../hooks/useConnection.ts';
import { useState, useEffect } from 'react';
import { Input } from '../components/Input.tsx';

export default function Account() {
  const { apiBase, serverPassword, setServerPassword } = useConnection();
  const [key, setKey] = useState(serverPassword);
  const [keyStatus, setKeyStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'open'>('idle');
  const [isServerOpen, setIsServerOpen] = useState(false);

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
        setTimeout(() => setKeyStatus('idle'), 1200);
      } else {
        setIsServerOpen(false);
        if (res.ok) {
          setServerPassword(key);
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

  const keyStatusMsg: Record<typeof keyStatus, string | null> = {
    idle: null,
    checking: null,
    valid: null,
    invalid: 'Invalid server password',
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 truncate" title={apiBase}>
            Backend: {apiBase}
          </p>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div>
              <label htmlFor="serverPassword" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                Server password
              </label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  id="serverPassword"
                  name="serverPassword"
                  autoComplete="off"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setKeyStatus('idle');
                  }}
                  placeholder="Leave empty if not set"
                  className="flex-1"
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
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Server has no password — open access</p>
              )}
              {!isServerOpen && apiBase && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Server requires a password</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
