import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, Loader2, GitBranch, History, ChevronDown } from 'lucide-react';
import { useApi } from '../lib/api.ts';
import { useClickOutside } from '../hooks/useClickOutside.ts';
import { VersionList } from './VersionList.tsx';
import type { Version } from '../lib/types.ts';

interface VersionPanelProps {
  domain: string;
  versions: Version[];
  versionsLoading: boolean;
  currentVersion: number | null;
  activating: number | null;
  deletingVersion: number | null;
  onActivate: (ts: number) => void;
  onDelete: (ts: number) => void;
  onDownload: (ts: number) => void;
  onUploaded: () => void;
  onToast: (message: string, success?: boolean) => void;
  isReadOnly?: boolean;
}

export function VersionPanel({
  domain,
  versions,
  versionsLoading,
  currentVersion,
  activating,
  deletingVersion,
  onActivate,
  onDelete,
  onDownload,
  onUploaded,
  onToast,
  isReadOnly = false,
}: VersionPanelProps) {
  const { apiFetch } = useApi();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showGithubFetch, setShowGithubFetch] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('');
  const [repoHistory, setRepoHistory] = useState<{ repo: string; branch: string; lastUsed: number }[]>([]);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const repoDropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(repoDropdownRef, () => setShowRepoDropdown(false), showRepoDropdown);

  // Load repo history mutation
  const loadRepoHistoryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/sites/${domain}/repos`);
      const data = await res.json();
      return (data.history as { repo: string; branch: string; lastUsed: number }[]) ?? [];
    },
    onSuccess: (data) => {
      setRepoHistory(data);
    },
  });

  // Upload version mutation
  const uploadVersionMutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const res = await apiFetch(`/sites/${domain}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/zip' },
        body: file,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
    },
    onSuccess: () => {
      onUploaded();
      onToast('Version uploaded', true);
    },
    onError: (err: Error) => {
      setUploadError(err.message);
      onToast('Upload failed', false);
    },
  });

  // Fetch from GitHub mutation
  const fetchGithubMutation = useMutation({
    mutationFn: async ({ repo, branch }: { repo: string; branch: string }) => {
      const res = await apiFetch(`/sites/${domain}/versions/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo, branch }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Fetch failed');
      }
    },
    onSuccess: () => {
      setGithubRepo('');
      setGithubBranch('');
      setShowGithubFetch(false);
      onUploaded();
      onToast('Version fetched from GitHub', true);
    },
    onError: (err: Error) => {
      setUploadError(err.message);
      onToast('Fetch failed', false);
    },
  });

  const loadRepoHistory = () => {
    loadRepoHistoryMutation.mutate();
  };

  const handleUpload = (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setUploadError('Only .zip files are accepted');
      return;
    }
    setUploadError(null);
    uploadVersionMutation.mutate({ file });
  };

  const handleFetchGithub = () => {
    if (!githubRepo.includes('/')) {
      setUploadError('Repo format: owner/repo');
      return;
    }
    setUploadError(null);
    fetchGithubMutation.mutate({ repo: githubRepo, branch: githubBranch || 'main' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
          Versions
          {versions.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <History className="w-3 h-3" />
              {versions.length} versions
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {versionsLoading && <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />}
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!showGithubFetch) loadRepoHistory();
                  setShowGithubFetch(!showGithubFetch);
                }}
                disabled={uploadVersionMutation.isPending}
                className={(() => {
                  const baseClasses =
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer disabled:cursor-auto';
                  const activeClasses = 'bg-purple-200 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300';
                  const inactiveClasses =
                    'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:hover:bg-zinc-100 dark:disabled:hover:bg-zinc-800';
                  const stateClasses = showGithubFetch ? activeClasses : inactiveClasses;
                  return `${baseClasses} ${stateClasses} disabled:opacity-50`;
                })()}
              >
                <GitBranch className="w-3.5 h-3.5" />
                {showGithubFetch ? 'Cancel' : 'From GitHub'}
              </button>
              <label
                className={
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ' +
                  (uploadVersionMutation.isPending
                    ? 'text-zinc-400 dark:text-zinc-500'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:hover:bg-zinc-100 dark:disabled:hover:bg-zinc-800')
                }
              >
                {uploadVersionMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {uploadVersionMutation.isPending ? 'Uploading...' : 'Upload New'}
                <input
                  type="file"
                  id="newVersionFile"
                  name="newVersionFile"
                  accept=".zip"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = '';
                  }}
                  disabled={uploadVersionMutation.isPending}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {showGithubFetch && (
        <div className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <div ref={repoDropdownRef} className="flex-1 relative">
              <input
                type="text"
                id="versionGithubRepo"
                name="versionGithubRepo"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                onFocus={() => repoHistory.length > 0 && setShowRepoDropdown(true)}
                placeholder="owner/repo"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
              {showRepoDropdown && repoHistory.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 max-h-48 overflow-auto">
                  <div className="px-3 py-1.5 text-xs text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-700">
                    Recent
                  </div>
                  {repoHistory.map((entry, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => {
                        setGithubRepo(entry.repo);
                        setGithubBranch(entry.branch);
                        setShowRepoDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-between"
                    >
                      <span className="text-zinc-950 dark:text-zinc-100">
                        {entry.repo}
                        <span className="text-zinc-400 dark:text-zinc-500 ml-2">@{entry.branch}</span>
                      </span>
                      <span className="text-xs text-zinc-400">{new Date(entry.lastUsed).toLocaleDateString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              id="versionGithubBranch"
              name="versionGithubBranch"
              value={githubBranch}
              onChange={(e) => setGithubBranch(e.target.value)}
              placeholder="branch (default: main)"
              className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
            <button
              type="button"
              onClick={handleFetchGithub}
              disabled={fetchGithubMutation.isPending || !githubRepo}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:hover:bg-zinc-300 dark:disabled:hover:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-auto"
            >
              {fetchGithubMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GitBranch className="w-4 h-4" />
              )}
              {fetchGithubMutation.isPending ? 'Fetching...' : 'Fetch & Add'}
            </button>
          </div>
        </div>
      )}

      {uploadError && <p className="text-xs text-purple-500 dark:text-purple-400 mb-3">{uploadError}</p>}
      {versions.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">No versions yet</p>
        </div>
      ) : (
        <>
          <VersionList
            versions={versions.slice(0, visibleCount)}
            currentVersion={currentVersion}
            activating={activating}
            deletingVersion={deletingVersion}
            onActivate={onActivate}
            onDelete={onDelete}
            onDownload={onDownload}
            isReadOnly={isReadOnly}
          />
          {versions.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount(versions.length)}
              className="mt-2 mx-auto flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Show {versions.length - visibleCount} more
            </button>
          )}
        </>
      )}
    </div>
  );
}
