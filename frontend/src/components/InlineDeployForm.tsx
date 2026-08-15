import { useState, useRef } from 'react';
import { Upload, FileArchive, GitBranch, Loader2, AlertCircle, Globe, Check, X } from 'lucide-react';
import { useCheckSiteId } from '../hooks/api/useCheckSiteId.ts';
import { useCheckSubdomain } from '../hooks/api/useCheckSubdomain.ts';
import { useCreateSite } from '../hooks/api/useCreateSite.ts';
import { useDeployGithub } from '../hooks/api/useDeployGithub.ts';
import { useAccentColor } from '../providers/AccentColorProvider.tsx';
import { useConnection } from '../hooks/useConnection.ts';
import { hostWithPort } from '../config.ts';
import { Input } from './Input.tsx';

type UploadMode = 'file' | 'github';

interface InlineDeployFormProps {
  onDeploy: (siteId: string) => void;
}

export function InlineDeployForm({ onDeploy }: InlineDeployFormProps) {
  const { username } = useConnection();
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const { createSite, isPending: uploadPending } = useCreateSite();
  const { deployGithub, isPending: githubPending } = useDeployGithub();
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [newSiteId, setNewSiteId] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { result: subdomainResult, checking: subdomainChecking } = useCheckSubdomain(newSubdomain);
  const { result: domainResult, checking: domainChecking } = useCheckSiteId(newSiteId, username ?? '');

  const reset = () => {
    setUploadMode('file');
    setNewSiteId('');
    setNewSubdomain('');
    setSelectedFile(null);
    setIsDragging(false);
    setUploadError(null);
    setGithubRepo('');
    setGithubBranch('');
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setUploadError('Only .zip files are accepted');
      return;
    }
    setUploadError(null);
    setSelectedFile(file);
    if (!newSiteId && file.name.length > 4) {
      const derived = file.name
        .slice(0, -4)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');
      if (derived) {
        setNewSiteId(derived);
        setNewSubdomain(username ? `${username}-${derived}` : '');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !newSiteId || !newSubdomain) {
      setUploadError(!newSiteId ? 'Enter a domain' : !newSubdomain ? 'Enter a subdomain' : 'Select a .zip file');
      return;
    }
    setUploadError(null);
    try {
      await createSite({ username: username ?? '', file: selectedFile, siteId: newSiteId, subdomain: newSubdomain });
      const siteId = newSiteId;
      reset();
      onDeploy(siteId);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleFetchGithub = async () => {
    if (!githubRepo.includes('/') || !newSiteId || !newSubdomain) {
      setUploadError(!newSiteId ? 'Enter a domain' : !newSubdomain ? 'Enter a subdomain' : 'Repo format: owner/repo');
      return;
    }
    setUploadError(null);
    try {
      await deployGithub({
        username: username ?? '',
        siteId: newSiteId,
        repo: githubRepo,
        branch: githubBranch || 'main',
        subdomain: newSubdomain,
      });
      const siteId = newSiteId;
      reset();
      onDeploy(siteId);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Fetch failed');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-1">Deploy New Site</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Upload a .zip file or connect a GitHub repository</p>
      </div>

      <div className="space-y-5">
        {/* Mode toggle */}
        <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`flex items-center gap-2 text-sm font-medium cursor-pointer ${
              uploadMode === 'file'
                ? 'text-zinc-950 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('github')}
            className={`flex items-center gap-2 text-sm font-medium cursor-pointer ${
              uploadMode === 'github'
                ? 'text-zinc-950 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            GitHub
          </button>
        </div>

        {/* File upload or GitHub inputs */}
        {uploadMode === 'github' ? (
          <div className="space-y-3">
            <Input
              type="text"
              id="githubRepo"
              name="githubRepo"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="owner/repo"
              
            />
            <Input
              type="text"
              id="githubBranch"
              name="githubBranch"
              value={githubBranch}
              onChange={(e) => setGithubBranch(e.target.value)}
              placeholder="branch (default: main)"
              
            />
          </div>
        ) : (
          (() => {
            const baseClasses =
              'border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 p-8 cursor-pointer';
            const draggingClasses = 'border-zinc-400 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/30';
            const selectedClasses = 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/20';
            const defaultClasses =
              'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700';
            const stateClasses = isDragging ? draggingClasses : selectedFile ? selectedClasses : defaultClasses;
            return (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`${baseClasses} ${stateClasses}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="zipFile"
                  name="zipFile"
                  accept=".zip"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center gap-3 w-full">
                    <FileArchive className="w-6 h-6 text-zinc-500 dark:text-zinc-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-100 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload
                      className={`w-8 h-8 ${isDragging ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'}`}
                    />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                      {isDragging ? 'Drop to upload' : 'Drop .zip or click to browse'}
                    </p>
                  </>
                )}
              </div>
            );
          })()
        )}

        {/* Domain input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              id="siteId"
              name="siteId"
              value={newSiteId}
              onChange={(e) => {
                const siteId = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setNewSiteId(siteId);
                setNewSubdomain(username ? `${username}-${siteId}` : '');
              }}
              placeholder="deployment-name"
              className="w-full pl-10 pr-3 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            />
          </div>
        </div>
        <div className="h-4">
          {domainResult && domainResult.siteId === newSiteId && domainResult.taken ? (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> {newSiteId} already taken
            </span>
          ) : domainResult && domainResult.siteId === newSiteId ? (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {newSiteId} available
            </span>
          ) : null}
        </div>

        {/* Subdomain input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              id="subdomain"
              name="subdomain"
              value={newSubdomain}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setNewSubdomain(val);
              }}
              placeholder="subdomain"
              
            />
          </div>
          <span className="text-zinc-400 dark:text-zinc-500 text-sm shrink-0">.{hostWithPort}</span>
        </div>
        <div className="h-4">
          {subdomainResult && subdomainResult.subdomain === newSubdomain && subdomainResult.taken ? (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> {subdomainResult.subdomain}.{hostWithPort} already taken
            </span>
          ) : subdomainResult && subdomainResult.subdomain === newSubdomain ? (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Available at {subdomainResult.subdomain}.{hostWithPort}
            </span>
          ) : null}
        </div>

        {/* Error message */}
        {uploadError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
          </div>
        )}

        {/* Deploy button */}
        <button
          type="button"
          onClick={() => (uploadMode === 'github' ? handleFetchGithub() : handleUpload())}
          disabled={
            uploadMode === 'github'
              ? githubPending ||
                !githubRepo ||
                !newSiteId ||
                !newSubdomain ||
                domainChecking ||
                domainResult?.taken ||
                subdomainChecking ||
                subdomainResult?.taken
              : uploadPending ||
                !selectedFile ||
                !newSiteId ||
                !newSubdomain ||
                domainChecking ||
                domainResult?.taken ||
                subdomainChecking ||
                subdomainResult?.taken
          }
          className={`w-full py-3 ${
            accentColorValues.textColor === 'light'
              ? 'text-white'
              : accentColorValues.textColor === 'inverted'
                ? 'text-zinc-100 dark:text-zinc-950'
                : 'text-zinc-950'
          }
            text-sm font-medium rounded-full flex items-center justify-center gap-2
              cursor-pointer disabled:cursor-auto ${accentColorValues.bg}           disabled:opacity-40`}
        >
          {uploadPending || githubPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deploying...
            </>
          ) : uploadMode === 'github' ? (
            <>
              <GitBranch className="w-4 h-4" />
              Fetch & Deploy
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Deploy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
