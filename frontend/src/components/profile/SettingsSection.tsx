import { useState } from 'react';
import { Key, LogOut, Monitor, User } from 'lucide-react';
import { useDeleteProfilePicture } from '../../hooks/api/useDeleteProfilePicture.ts';
import { useDeleteSession } from '../../hooks/api/useDeleteSession.ts';
import { useSessions } from '../../hooks/api/useSessions.ts';
import { useUpdateDisplayName } from '../../hooks/api/useUpdateDisplayName.ts';
import { useUploadProfilePicture } from '../../hooks/api/useUploadProfilePicture.ts';
import { useMe } from '../../hooks/api/useMe.ts';
import { useConnection } from '../../hooks/useConnection.ts';
import { useAccentColor } from '../../providers/AccentColorProvider.tsx';
import { useToast } from '../../providers/ToastContext.tsx';
import { formatUserAgent } from '../../lib/userAgent.ts';
import { Tooltip } from '../Tooltip.tsx';

interface SettingsSectionProps {
  username: string;
}

export function SettingsSection({ username }: SettingsSectionProps) {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const { showToast } = useToast();
  const { apiBase, sessionId } = useConnection();
  const { user } = useMe();
  const displayName = user?.displayName ?? '';
  const profilePicture = user?.profilePicture;
  const { sessions, loading: sessionsLoading } = useSessions();
  const { deleteSession } = useDeleteSession();
  const { updateDisplayName } = useUpdateDisplayName();
  const { uploadProfilePicture } = useUploadProfilePicture();
  const { deleteProfilePicture } = useDeleteProfilePicture();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [editingDisplayName, setEditingDisplayName] = useState('');
  const [displayNameStatus, setDisplayNameStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB');
      return;
    }

    setUploadingProfilePicture(true);
    try {
      await uploadProfilePicture(file);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to upload profile picture', false);
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await deleteProfilePicture();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete profile picture', false);
    }
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
    setPasswordStatus('saved');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus('idle'), 2000);
  };

  const saveDisplayName = async () => {
    if (!editingDisplayName.trim()) {
      setDisplayNameStatus('error');
      setTimeout(() => setDisplayNameStatus('idle'), 2000);
      return;
    }
    try {
      await updateDisplayName(editingDisplayName);
      setDisplayNameStatus('saved');
      setTimeout(() => setDisplayNameStatus('idle'), 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update display name', false);
      setDisplayNameStatus('error');
      setTimeout(() => setDisplayNameStatus('idle'), 2000);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600';
  const avatarClass = `w-16 h-16 rounded-full ${accentColorValues.bgLight} flex items-center justify-center`;
  const usernameInputClass = [
    inputClass,
    'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-not-allowed',
  ].join(' ');

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">Profile Picture</label>
              <div className="flex items-center gap-4">
                {profilePicture ? (
                  <img
                    src={`${apiBase}/users/${username}/profile-picture?v=${profilePicture ?? ''}`}
                    alt={displayName || username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className={avatarClass}>
                    <User className={`w-8 h-8 ${accentColorValues.textDark}`} />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="px-3 py-2 text-sm bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 font-medium rounded-lg cursor-pointer">
                    {uploadingProfilePicture ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={uploadingProfilePicture}
                    />
                  </label>
                  {profilePicture && (
                    <button
                      onClick={handleDeleteProfilePicture}
                      className="px-3 py-2 text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium rounded-lg cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="displayName" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                Display Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={editingDisplayName || displayName || ''}
                  onChange={(e) => setEditingDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={saveDisplayName}
                  className="px-4 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 font-medium rounded-lg cursor-pointer"
                >
                  {displayNameStatus === 'saved' ? 'Saved' : displayNameStatus === 'error' ? 'Error' : 'Save'}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">Username</p>
              <p className="text-sm text-zinc-950 dark:text-zinc-100 font-mono">@{username || 'Not set'}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Password
          </h2>
          <form
            className="space-y-4 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              savePassword();
            }}
          >
            <div>
              <label htmlFor="username" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                value={username || ''}
                readOnly
                className={usernameInputClass}
              />
            </div>
            <div>
              <label htmlFor="currentPassword" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
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
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
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
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 font-medium rounded-lg cursor-pointer"
                >
                  {passwordStatus === 'saved' ? 'Saved' : passwordStatus === 'error' ? 'Error' : 'Change'}
                </button>
              </div>
              {passwordStatus === 'error' && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  Passwords do not match or fields are empty
                </p>
              )}
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Active Sessions
          </h2>
          <div className="flex flex-col gap-3 max-w-2xl">
            {sessionsLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg h-16 animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No active sessions</p>
            ) : (
              [...sessions]
                .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between w-full py-4 pr-4 overflow-hidden">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Monitor className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-100 truncate">
                          {formatUserAgent(session.userAgent)}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Last active {new Date(session.lastActive).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {session.id === sessionId ? (
                      <button
                        type="button"
                        disabled
                        className="p-2 rounded-lg shrink-0 cursor-default text-zinc-500 dark:text-zinc-400 disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    ) : (
                      <Tooltip content="Revoke session">
                        <button
                          type="button"
                          onClick={() => {
                            deleteSession(session.id)
                              .then(() => {
                                showToast('Session revoked', true);
                              })
                              .catch(() => {
                                showToast('Failed to revoke session', false);
                              });
                          }}
                          className="p-2 rounded-lg shrink-0 cursor-pointer text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
