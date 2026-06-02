import { useState, useRef } from 'react';
import { Upload, Loader2, GitBranch, History } from 'lucide-react';
import { useApi } from '../lib/api.ts';
import { useClickOutside } from '../lib/useClickOutside.ts';
import { VersionList } from './VersionList.tsx';
import type { Version } from '../lib/types.ts';

interface VersionPanelProps {
  domain: string;
  versions: Version[];
  versionsLoading: boolean;
  currentVersion: number | null;
  activating: number | null;
  deletingVersion: number | null;
  accent: string | null;
  onActivate: (ts: number) => void;
  onDelete: (ts: number) => void;
  onDownload: (ts: number) => void;
  onUploaded: () => void;
  onToast: (message: string, success?: boolean) => void;
}

export function VersionPanel({
  domain,
  versions,
  versionsLoading,
  currentVersion,
  activating,
  deletingVersion,
  accent,
  onActivate,
  onDelete,
  onDownload,
  onUploaded,
  onToast,
}: VersionPanelProps) {
  const { apiFetch } = useApi();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showGithubFetch, setShowGithubFetch] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('');
  const [repoHistory, setRepoHistory] = useState<{ repo: string; branch: string; lastUsed: number }[]>([]);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const repoDropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(repoDropdownRef, () => setShowRepoDropdown(false), showRepoDropdown);

  const loadRepoHistory = async () => {
    try {
      const res = await apiFetch(`/sites/${domain}/repos`);
      const data = await res.json();
      setRepoHistory((data.history as { repo: string; branch: string; lastUsed: number }[]) ?? []);
    } catch {
      /* non-critical */
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setUploadError('Only .zip files are accepted');
      return;
    }
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('zip', file);
    try {
      const res = await apiFetch(`/sites/${domain}/versions`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        onUploaded();
        onToast('Version uploaded', true);
      } else {
        setUploadError(data.error || 'Upload failed');
        onToast('Upload failed', false);
      }
    } catch {
      setUploadError('Upload failed');
      onToast('Upload failed', false);
    } finally {
      setUploading(false);
    }
  };

  const handleFetchGithub = async () => {
    if (!githubRepo.includes('/')) {
      setUploadError('Repo format: owner/repo');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const res = await apiFetch(`/sites/${domain}/versions/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: githubRepo, branch: githubBranch || 'main' }),
      });
      const data = await res.json();
      if (data.success) {
        setGithubRepo('');
        setGithubBranch('');
        setShowGithubFetch(false);
        onUploaded();
        onToast('Version fetched from GitHub', true);
      } else {
        setUploadError(data.error || 'Fetch failed');
        onToast('Fetch failed', false);
      }
    } catch {
      setUploadError('Fetch failed');
      onToast('Fetch failed', false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
          Versions
          {versions.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
              <History className="w-3 h-3" />
              {versions.length} versions
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {versionsLoading && <Loader2 className="w-3 h-3 text-stone-400 animate-spin" />}
          <button
            type="button"
            onClick={() => {
              if (!showGithubFetch) loadRepoHistory();
              setShowGithubFetch(!showGithubFetch);
            }}
            disabled={uploading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer disabled:cursor-auto ${
              showGithubFetch
                ? 'bg-purple-200 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:hover:bg-stone-100 dark:disabled:hover:bg-stone-800'
            } disabled:opacity-50`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            {showGithubFetch ? 'Cancel' : 'From GitHub'}
          </button>
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              uploading
                ? 'text-stone-400 dark:text-stone-500'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:hover:bg-stone-100 dark:disabled:hover:bg-stone-800'
            }`}
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? 'Uploading...' : 'Upload New'}
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
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {showGithubFetch && (
        <div className="mb-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-800">
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
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
              {showRepoDropdown && repoHistory.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg py-1 max-h-48 overflow-auto">
                  <div className="px-3 py-1.5 text-xs text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-700">
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
                      className="w-full px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-between"
                    >
                      <span className="text-stone-900 dark:text-stone-100">
                        {entry.repo}
                        <span className="text-stone-400 dark:text-stone-500 ml-2">@{entry.branch}</span>
                      </span>
                      <span className="text-xs text-stone-400">{new Date(entry.lastUsed).toLocaleDateString()}</span>
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
              className="flex-1 px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500"
            />
            <button
              type="button"
              onClick={handleFetchGithub}
              disabled={uploading || !githubRepo}
              className="px-4 py-2 bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 disabled:bg-stone-300 dark:disabled:bg-stone-800 disabled:hover:bg-stone-300 dark:disabled:hover:bg-stone-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-auto"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
              {uploading ? 'Fetching...' : 'Fetch & Add'}
            </button>
          </div>
        </div>
      )}

      {uploadError && <p className="text-xs text-purple-500 dark:text-purple-400 mb-3">{uploadError}</p>}
      <div className="h-64 relative">
        <div className="absolute inset-0 overflow-y-auto">
          {versions.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-stone-400 dark:text-stone-500">No versions yet</p>
            </div>
          ) : (
            <VersionList
              versions={versions}
              currentVersion={currentVersion}
              activating={activating}
              deletingVersion={deletingVersion}
              onActivate={onActivate}
              onDelete={onDelete}
              onDownload={onDownload}
              accent={accent}
            />
          )}
        </div>
      </div>
    </div>
  );
}
