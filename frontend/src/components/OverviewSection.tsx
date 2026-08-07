import { ExternalLink, Power, Eye, X, Image as ImageIcon } from 'lucide-react';
import { useAccentColor } from '../providers/AccentColorProvider.tsx';
import { useDeleteCover } from '../hooks/api/useDeleteCover.ts';
import { useUploadCover } from '../hooks/api/useUploadCover.ts';
import { useToast } from '../providers/ToastContext.tsx';
import { useState } from 'react';
import { processImageTo4to3 } from '../lib/image.ts';
import type { Site } from '../lib/types.ts';
import { apiBase } from '../config.ts';

interface OverviewSectionProps {
  site: Site | null;
  siteLoading: boolean;
  actionLoading: boolean;
  onToggle: () => void;
  siteUrl: string;
  host: string;
  totalHits: number;
  uptimePct: number | null;
  isReadOnly?: boolean;
}

export function OverviewSection({
  site,
  siteLoading,
  actionLoading,
  onToggle,
  siteUrl,
  host,
  totalHits,
  uptimePct,
  isReadOnly = false,
}: OverviewSectionProps) {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  const { showToast } = useToast();
  const { uploadCover } = useUploadCover(site?.domain ?? '');
  const { deleteCover } = useDeleteCover(site?.domain ?? '');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deletingCover, setDeletingCover] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !site) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', false);
      return;
    }

    setUploadingCover(true);
    try {
      // Process image to 4:3 aspect ratio
      const processedFile = await processImageTo4to3(file);

      await uploadCover(processedFile);
      showToast('Cover image uploaded', true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to upload cover', false);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCoverDelete = async () => {
    if (!site) return;

    setDeletingCover(true);
    try {
      await deleteCover();
      showToast('Cover image removed', true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete cover', false);
    } finally {
      setDeletingCover(false);
    }
  };

  const coverUrl = site?.coverImage ? `${apiBase}/sites/${site.domain}/cover` : null;
  return siteLoading ? (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 mt-0.5">
          <button
            type="button"
            disabled
            className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg opacity-50 cursor-not-allowed"
          >
            <span className="invisible">Enable</span>
          </button>
        </div>
      </div>
      <div className="w-full aspect-[16/9] rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
    </div>
  ) : site ? (
    (() => {
      const initial = site.domain[0].toUpperCase();
      const baseIconClasses =
        'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-base font-semibold select-none overflow-hidden';
      const enabledIconClasses = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300';
      const disabledIconClasses = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600';
      const iconStateClasses = site.enabled ? enabledIconClasses : disabledIconClasses;
      return (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`${baseIconClasses} ${iconStateClasses}`}>
                <span className="text-xl font-semibold text-zinc-600 dark:text-zinc-400">{initial}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100 truncate">{site.domain}</h1>
                  <span
                    className={`shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      !site.enabled
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        : `${accentColorValues.bgLight} ${accentColorValues.text}`
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${!site.enabled ? 'bg-zinc-400 dark:bg-zinc-500' : accentColorValues.dot}`}
                    />
                    {site.enabled ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => !site.enabled && e.preventDefault()}
                    className={`flex items-center gap-1 text-xs ${
                      site.enabled
                        ? 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        : 'text-zinc-300 dark:text-zinc-600 pointer-events-none'
                    }`}
                  >
                    {site.subdomain
                      ? `${site.subdomain}.${site.subdomainBase || host}`
                      : `${site.domain}.${site.subdomainBase || host}`}
                    {site.enabled && <ExternalLink className="w-3 h-3" />}
                  </a>
                  {totalHits > 0 && (
                    <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                      <Eye className="w-3 h-3" />
                      {totalHits.toLocaleString()} views
                    </span>
                  )}
                  {uptimePct !== null && (
                    <span
                      className={`text-xs font-medium ${
                        uptimePct < 90 ? 'text-zinc-400 dark:text-zinc-500' : accentColorValues.text
                      }`}
                    >
                      {uptimePct}% uptime
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0 mt-0.5">
              <button
                type="button"
                onClick={onToggle}
                disabled={actionLoading || isReadOnly}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer disabled:cursor-auto disabled:opacity-50 w-24 justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                <Power className="w-3.5 h-3.5 shrink-0" />
                <span className="w-14 text-center">{site.enabled ? 'Disable' : 'Enable'}</span>
              </button>
            </div>
          </div>

          {/* Cover Image Section */}
          <div>
            {!isReadOnly && (
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
                className="hidden"
                id="coverUpload"
              />
            )}
            {coverUrl ? (
              <div className="relative group w-full max-w-xs">
                <img
                  src={coverUrl || undefined}
                  alt="Site cover"
                  className="w-full aspect-4/3 object-cover rounded-2xl cursor-pointer"
                  onClick={() => !isReadOnly && document.getElementById('coverUpload')?.click()}
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleCoverDelete}
                    disabled={deletingCover}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div
                className="w-full max-w-xs aspect-4/3 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                onClick={() => !isReadOnly && document.getElementById('coverUpload')?.click()}
              >
                <ImageIcon className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {isReadOnly ? 'No cover image' : uploadingCover ? 'Uploading...' : 'Add a cover image'}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    })()
  ) : null;
}
