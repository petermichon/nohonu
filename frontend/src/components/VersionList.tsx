import { CheckCircle2, Clock, Trash2, ArrowUp, Download, Loader2, GitBranch, FileUp } from 'lucide-react';
import { relativeTime } from '../lib/utils.ts';
import { Tooltip } from './Tooltip.tsx';
import { useAccentColor } from '../lib/AccentColorProvider.tsx';
import type { Version } from '../lib/types.ts';

interface VersionListProps {
  versions: Version[];
  currentVersion: number | null;
  activating: number | null;
  deletingVersion: number | null;
  onActivate: (index: number) => void;
  onDelete: (index: number) => void;
  onDownload: (index: number) => void;
}

export function VersionList({
  versions,
  currentVersion,
  activating,
  deletingVersion,
  onActivate,
  onDelete,
  onDownload,
}: VersionListProps) {
  const { getAccentColorValues } = useAccentColor();
  const accentColorValues = getAccentColorValues();
  return (
    <div className="space-y-1">
      {versions.map((v) => {
        const isCurrent = v.index === currentVersion;
        const isActivating = activating === v.index;
        const isDeleting = deletingVersion === v.index;
        const date = new Date(v.createdAt);
        return (
          <div key={v.index} className="flex items-center justify-between px-3 py-2.5 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              {isCurrent ? (
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${accentColorValues.text}`} />
              ) : (
                <Clock className="w-4 h-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-sm ${isCurrent ? 'font-medium text-zinc-800 dark:text-zinc-200' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {isCurrent && (
                    <span
                      className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        accentColorValues.bgLight
                      }`}
                    >
                      <span className={accentColorValues.text}>Online</span>
                    </span>
                  )}
                  {v.source?.type === 'github' ? (
                    <Tooltip content={`${v.source.repo}@${v.source.branch}`}>
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        <GitBranch className="w-3 h-3" />
                        {v.source.repo}
                      </span>
                    </Tooltip>
                  ) : v.source?.type === 'upload' ? (
                    <Tooltip content="File upload">
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        <FileUp className="w-3 h-3" />
                        Upload
                      </span>
                    </Tooltip>
                  ) : null}
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {(v.size / 1024).toFixed(1)} KB · {relativeTime(v.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 ml-2 shrink-0">
              <Tooltip content="Download">
                <button
                  type="button"
                  onClick={() => onDownload(v.index)}
                  className="p-1.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content={isCurrent ? 'Cannot delete active version' : 'Delete'}>
                <button
                  type="button"
                  onClick={() => onDelete(v.index)}
                  disabled={isDeleting || isCurrent}
                  className={`p-1.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-auto disabled:hover:bg-transparent dark:disabled:hover:bg-transparent disabled:hover:text-zinc-700 dark:disabled:hover:text-zinc-300 ${!isCurrent ? 'hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </Tooltip>
              <Tooltip content={isCurrent ? 'Already active' : 'Activate'}>
                <button
                  type="button"
                  onClick={() => onActivate(v.index)}
                  disabled={isActivating || isCurrent}
                  className="ml-1 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-auto bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:hover:bg-zinc-100 dark:disabled:hover:bg-zinc-800"
                >
                  {isActivating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-3.5 h-3.5" />
                  )}
                  Activate
                </button>
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
}
