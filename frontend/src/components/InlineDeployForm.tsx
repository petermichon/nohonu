import { useState, useRef } from 'react';
import { Plus, Upload, X, FileArchive, GitBranch, Loader2, AlertCircle, Globe } from 'lucide-react';
import { useApi } from '../lib/api.ts';

type UploadMode = 'file' | 'github';

interface InlineDeployFormProps {
  onDeploy: () => void;
}

export function InlineDeployForm({ onDeploy }: InlineDeployFormProps) {
  const { apiFetch, host } = useApi();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [newDomain, setNewDomain] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setIsOpen(false);
    setUploadMode('file');
    setNewDomain('');
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
    if (!newDomain && file.name.length > 4) {
      const derived = file.name
        .slice(0, -4)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');
      if (derived) setNewDomain(derived);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !newDomain) {
      setUploadError(!newDomain ? 'Enter a domain' : 'Select a .zip file');
      return;
    }
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('zip', selectedFile);
    try {
      const res = await apiFetch(`/sites/${newDomain}/versions`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        reset();
        onDeploy();
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFetchGithub = async () => {
    if (!githubRepo.includes('/') || !newDomain) {
      setUploadError(!newDomain ? 'Enter a domain' : 'Repo format: owner/repo');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const res = await apiFetch(`/sites/${newDomain}/versions/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: githubRepo, branch: githubBranch || 'main' }),
      });
      const data = await res.json();
      if (data.success) {
        reset();
        onDeploy();
      } else {
        setUploadError(data.error || 'Fetch failed');
      }
    } catch {
      setUploadError('Fetch failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-all cursor-pointer h-[58px]"
      >
        <Plus className="w-4 h-4 text-stone-500 dark:text-stone-400" />
        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Deploy site</span>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Deploy New Site</h3>
        <button
          type="button"
          onClick={reset}
          className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              uploadMode === 'file'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            <Upload className="w-3 h-3" />
            File
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('github')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              uploadMode === 'github'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            <GitBranch className="w-3 h-3" />
            GitHub
          </button>
        </div>

        {/* Domain input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              id="domain"
              name="domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="subdomain"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              autoFocus
            />
          </div>
          <span className="text-stone-400 dark:text-stone-500 text-xs shrink-0">.{host}</span>
        </div>

        {/* File upload or GitHub inputs */}
        {uploadMode === 'github' ? (
          <div className="grid gap-3">
            <input
              type="text"
              id="githubRepo"
              name="githubRepo"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="owner/repo"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white dark:focus:bg-stone-900 transition-colors"
            />
            <input
              type="text"
              id="githubBranch"
              name="githubBranch"
              value={githubBranch}
              onChange={(e) => setGithubBranch(e.target.value)}
              placeholder="branch (default: main)"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white dark:focus:bg-stone-900 transition-colors"
            />
          </div>
        ) : (
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
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 p-6 cursor-pointer transition-all ${
              isDragging
                ? 'border-stone-900 dark:border-stone-400 bg-stone-50 dark:bg-stone-800/50'
                : selectedFile
                  ? 'border-stone-400 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/30'
                  : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
            }`}
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
              <div className="flex items-center gap-2 w-full">
                <FileArchive className="w-5 h-5 text-stone-500 dark:text-stone-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-stone-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>
            ) : (
              <>
                <Upload
                  className={`w-5 h-5 ${isDragging ? 'text-stone-700 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500'}`}
                />
                <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
                  {isDragging ? 'Drop to upload' : 'Drop .zip or click to browse'}
                </p>
              </>
            )}
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
          </div>
        )}

        {/* Deploy button */}
        <button
          type="button"
          onClick={() => (uploadMode === 'github' ? handleFetchGithub() : handleUpload())}
          disabled={uploading || (uploadMode === 'github' ? !githubRepo || !newDomain : !selectedFile || !newDomain)}
          className="w-full py-2 bg-purple-400 dark:bg-purple-400 hover:bg-purple-300 dark:hover:bg-purple-300 disabled:opacity-40 text-white dark:text-stone-900 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-auto"
        >
          {uploading ? (
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
