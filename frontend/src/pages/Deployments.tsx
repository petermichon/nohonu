import { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2, Plus, AlertCircle, Upload, X, FileArchive, Globe, Search, GitBranch } from 'lucide-react';
import { SiteCard } from '../components/SiteCard';
import { ConfirmModal } from '../lib/ConfirmModal';
import { Modal } from '../lib/Modal';
import { useApi } from '../lib/api';
import type { Site } from '../lib/types';

type UploadMode = 'file' | 'github';

function Deployments() {
  const { apiFetch, host } = useApi();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{ domain: string; enabled: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('');

  const loadSites = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiFetch('/sites');
      const data = await res.json();
      setSites(data.sites || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSites(); }, []);

  const handleToggle = async () => {
    if (!confirmToggle) return;
    const { domain } = confirmToggle;
    setToggling(domain);
    setConfirmToggle(null);
    try {
      await apiFetch(`/sites/${domain}/toggle`, { method: 'PATCH' });
      await loadSites();
    } catch {
      // Silent fail
    } finally {
      setToggling(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) { setUploadError('Select a .zip file'); return; }
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('domain', newDomain);
    formData.append('zip', selectedFile);
    try {
      const res = await apiFetch('/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        resetUpload();
        await loadSites();
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.zip')) { setUploadError('Only .zip files are accepted'); return; }
    setUploadError(null);
    setSelectedFile(file);
    if (!newDomain && file.name.length > 4) {
      const derived = file.name.slice(0, -4).toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (derived) setNewDomain(derived);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFetchGithub = async () => {
    if (!githubRepo.includes('/')) { setUploadError('Repo format: owner/repo'); return; }
    setUploading(true);
    setUploadError(null);
    try {
      const res = await apiFetch('/fetch-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain, repo: githubRepo, branch: githubBranch || 'main' }),
      });
      const data = await res.json();
      if (data.success) {
        resetUpload();
        await loadSites();
      } else {
        setUploadError(data.error || 'Fetch failed');
      }
    } catch {
      setUploadError('Fetch failed');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setShowUpload(false);
    setUploadError(null);
    setNewDomain('');
    setSelectedFile(null);
    setIsDragging(false);
    setUploadMode('file');
    setGithubRepo('');
    setGithubBranch('');
  };

  const filteredSites = useMemo(() => {
    const filtered = sites.filter(s =>
      s.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) =>
      b.enabled === a.enabled ? a.domain.localeCompare(b.domain) : b.enabled ? 1 : -1
    );
  }, [sites, searchQuery]);

  const stats = useMemo(() => ({
    enabled: sites.filter(s => s.enabled).length,
    disabled: sites.filter(s => !s.enabled).length,
  }), [sites]);

  return (
    <section className="mb-12">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-stone-900 dark:text-stone-100">Deployments</h1>
          {!loading && !error && sites.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                {stats.enabled}
              </span>
              {stats.disabled > 0 && (
                <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-600 inline-block" />
                  {stats.disabled}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!loading && !error && sites.length > 0 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter..."
                className="w-32 sm:w-40 pl-8 pr-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 transition-colors"
              />
            </div>
          )}
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-400 dark:bg-purple-400 hover:bg-purple-300 dark:hover:bg-purple-300 text-white dark:text-stone-900 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Deploy
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-stone-400 dark:text-stone-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Can't connect to server</p>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">Please check if the server is running</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sites.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-stone-500 dark:text-stone-400">No sites yet — click Deploy to get started</p>
            </div>
          ) : filteredSites.length === 0 && searchQuery ? (
            <div className="text-center py-16">
              <p className="text-sm text-stone-500 dark:text-stone-400">No sites match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 mt-1"
              >
                Clear filter
              </button>
            </div>
          ) : filteredSites.map((site) => (
            <SiteCard
              key={site.domain}
              site={site}
              onToggle={(d) => setConfirmToggle({ domain: d, enabled: sites.find(s => s.domain === d)?.enabled ?? false })}
              loading={toggling}
            />
          ))}
        </div>
      )}

      {/* Deploy modal */}
      <Modal isOpen={showUpload} onClose={resetUpload} title="Deploy New Site">
        <div className="flex flex-col gap-4">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1 w-fit">
            <button
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

          {/* Domain */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="subdomain"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white dark:focus:bg-stone-900 transition-colors"
                autoFocus
              />
            </div>
            <span className="text-stone-400 dark:text-stone-500 text-xs shrink-0">.{host}</span>
          </div>

          {uploadMode === 'github' ? (
            <>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="owner/repo"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              />
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder="branch (default: main)"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              />
            </>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
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
                accept=".zip"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
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
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className={`w-5 h-5 ${isDragging ? 'text-stone-700 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500'}`} />
                  <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
                    {isDragging ? 'Drop to upload' : 'Drop .zip or click to browse'}
                  </p>
                </>
              )}
            </div>
          )}

          {uploadError && (
            <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
            </div>
          )}

          <button
            onClick={() => uploadMode === 'github' ? handleFetchGithub() : handleUpload()}
            disabled={uploading || (uploadMode === 'github' ? !githubRepo || !newDomain : !selectedFile || !newDomain)}
            className="w-full py-2 bg-purple-400 dark:bg-purple-400 hover:bg-purple-300 dark:hover:bg-purple-300 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-stone-900 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Deploying...</>
            ) : uploadMode === 'github' ? (
              <><GitBranch className="w-4 h-4" />Fetch & Deploy</>
            ) : (
              <><Upload className="w-4 h-4" />Deploy</>
            )}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggle}
        action={confirmToggle?.enabled ? 'disable' : 'enable'}
        domain={confirmToggle?.domain ?? ''}
        loading={toggling === confirmToggle?.domain}
      />
    </section>
  );
}

export default Deployments;
