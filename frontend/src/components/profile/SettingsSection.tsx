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
import { Input } from '../Input.tsx';
import { Button } from '../Button.tsx';
import { Field } from '../Field.tsx';
import { SaveField } from '../SaveField.tsx';

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
  const [editingDisplayName, setEditingDisplayName] = useState<string | null>(null);
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
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', false);
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const isPasswordComplete = Boolean(
    currentPassword && newPassword && confirmPassword && newPassword === confirmPassword
  );

  const saveDisplayName = async () => {
    if (!editingDisplayName.trim()) {
      showToast('Display name cannot be empty', false);
      return;
    }
    try {
      await updateDisplayName(editingDisplayName);
      setEditingDisplayName(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update display name', false);
    }
  };

  const isDisplayNameDirty = editingDisplayName !== null && editingDisplayName.trim() !== displayName;

  const avatarClass = `w-16 h-16 rounded-full ${accentColorValues.bgLight} flex items-center justify-center`;
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
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">Profile Picture</p>
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
            <SaveField
              label="Display Name"
              htmlFor="displayName"
              value={editingDisplayName ?? displayName ?? ''}
              onChange={(value) => setEditingDisplayName(value)}
              placeholder="Enter display name"
              onSave={saveDisplayName}
              saveDisabled={!isDisplayNameDirty}
            />
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
            <Field label="Username" htmlFor="username">
              <Input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                value={username || ''}
                readOnly
                className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </Field>
            <Field label="Current Password" htmlFor="currentPassword">
              <Input
                type="password"
                id="currentPassword"
                name="currentPassword"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Field label="New Password" htmlFor="newPassword">
              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <SaveField
              label="Confirm New Password"
              htmlFor="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(value) => setConfirmPassword(value)}
              placeholder="••••••••"
              autoComplete="new-password"
              action={
                <Button
                  type="submit"
                  className=""
                  disabled={!isPasswordComplete}
                >
                  Change
                </Button>
              }
            />
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
                          aria-label="Revoke session"
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
