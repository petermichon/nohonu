import { User, Key, Server, UserCircle } from 'lucide-react';
import { Section } from '../components/Section.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useState, useEffect } from 'react';

export default function Account() {
  const {
    apiBase,
    apiKey,
    username,
    displayName,
    email,
    setApiBase,
    setApiKey,
    setUsername,
    setDisplayName,
    setEmail,
  } = useConnection();
  const [url, setUrl] = useState(apiBase);
  const [key, setKey] = useState(apiKey);
  const [localUsername, setLocalUsername] = useState(username);
  const [localDisplayName, setLocalDisplayName] = useState(displayName);
  const [localEmail, setLocalEmail] = useState(email);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'saved'>('idle');
  const [displayNameStatus, setDisplayNameStatus] = useState<'idle' | 'saved'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'saved'>('idle');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saved' | 'error'>('idle');
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

  const saveDisplayName = () => {
    const trimmed = localDisplayName.trim();
    setLocalDisplayName(trimmed);
    setDisplayName(trimmed);
    setDisplayNameStatus('saved');
    setTimeout(() => setDisplayNameStatus('idle'), 800);
  };

  const saveEmail = () => {
    const trimmed = localEmail.trim();
    setLocalEmail(trimmed);
    setEmail(trimmed);
    setEmailStatus('saved');
    setTimeout(() => setEmailStatus('idle'), 800);
  };

  const savePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus('error');
      setTimeout(() => setPasswordStatus('idle'), 2000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setTimeout(() => setPasswordStatus('idle'), 2000);
      return;
    }
    // TODO: Implement backend password change
    setPasswordStatus('saved');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus('idle'), 2000);
  };

  const saveUsername = () => {
    const trimmed = localUsername
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');
    setLocalUsername(trimmed);
    setUsername(trimmed);
    setUsernameStatus('saved');
    setTimeout(() => setUsernameStatus('idle'), 800);
  };

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
    <div className="px-6">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-100 mb-6">Account</h1>

      <Section id="profile" icon={User} title="Profile">
        <div className="grid gap-4 max-w-md">
          <div>
            <label htmlFor="displayName" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={localDisplayName}
                onChange={(e) => {
                  setLocalDisplayName(e.target.value);
                  setDisplayNameStatus('idle');
                }}
                placeholder="John Doe"
                className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="button"
                onClick={saveDisplayName}
                className="px-4 py-2 text-sm bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 text-white dark:text-zinc-950 font-medium rounded-lg cursor-pointer"
              >
                {displayNameStatus === 'saved' ? 'Saved' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Your public name (e.g., John Doe)</p>
          </div>
          <div>
            <label htmlFor="username" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Username
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="username"
                name="username"
                value={localUsername}
                onChange={(e) => {
                  setLocalUsername(e.target.value);
                  setUsernameStatus('idle');
                }}
                placeholder="your-username"
                className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="button"
                onClick={saveUsername}
                className="px-4 py-2 text-sm bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 text-white dark:text-zinc-950 font-medium rounded-lg cursor-pointer"
              >
                {usernameStatus === 'saved' ? 'Saved' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Used to identify your sites. Lowercase letters, numbers, hyphens and underscores only.
            </p>
            {localUsername && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Your page: <span className="font-mono">/u/{localUsername}</span>
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section id="account" icon={UserCircle} title="Account">
        <div className="grid gap-4 max-w-md">
          <div>
            <label htmlFor="email" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                id="email"
                name="email"
                value={localEmail}
                onChange={(e) => {
                  setLocalEmail(e.target.value);
                  setEmailStatus('idle');
                }}
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="button"
                onClick={saveEmail}
                className="px-4 py-2 text-sm bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 text-white dark:text-zinc-950 font-medium rounded-lg cursor-pointer"
              >
                {emailStatus === 'saved' ? 'Saved' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Your email address for account notifications
            </p>
          </div>
          <div>
            <label htmlFor="currentPassword" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Confirm New Password
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="button"
                onClick={savePassword}
                className="px-4 py-2 text-sm bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 text-white dark:text-zinc-950 font-medium rounded-lg cursor-pointer"
              >
                {passwordStatus === 'saved' ? 'Saved' : passwordStatus === 'error' ? 'Error' : 'Change'}
              </button>
            </div>
            {passwordStatus === 'error' && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">Passwords do not match or fields are empty</p>
            )}
          </div>
        </div>
      </Section>

      <Section id="security" icon={Key} title="Security">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Security settings are not yet available.</p>
      </Section>

      <Section id="connection" icon={Server} title="Connection">
        <div className="grid gap-4 max-w-md">
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
                className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="button"
                onClick={saveUrl}
                disabled={urlStatus === 'checking'}
                className="px-4 py-2 text-sm bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-zinc-950 font-medium rounded-lg cursor-pointer disabled:cursor-auto"
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
                className="px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-zinc-700 dark:text-zinc-300 rounded-md cursor-pointer"
              >
                http://localhost:8080
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrl('https://localhost/api');
                  setUrlStatus('idle');
                }}
                className="px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-zinc-700 dark:text-zinc-300 rounded-md cursor-pointer"
              >
                https://localhost/api
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrl('https://nohonu.com/api');
                  setUrlStatus('idle');
                }}
                className="px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-zinc-700 dark:text-zinc-300 rounded-md cursor-pointer"
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
                className="flex-1 px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                type="button"
                onClick={saveKey}
                disabled={keyStatus === 'checking'}
                className="px-4 py-2 text-sm bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 text-white dark:text-zinc-950 font-medium rounded-lg cursor-pointer disabled:cursor-auto"
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
      </Section>

      <div className="min-h-[50vh]" />
    </div>
  );
}
