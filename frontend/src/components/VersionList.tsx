import { CheckCircle2, Clock, Trash2, ArrowUp, Download, Loader2, GitBranch, FileUp } from 'lucide-react';
import { relativeTime } from '../lib/utils.ts';
import { Tooltip } from './Tooltip.tsx';
import type { Version } from '../lib/types.ts';

interface VersionListProps {
  versions: Version[];
  currentVersion: number | null;
  activating: number | null;
  deletingVersion: number | null;
  onActivate: (index: number) => void;
  onDelete: (index: number) => void;
  onDownload: (index: number) => void;
  accent?: string | null;
}

export function VersionList({
  versions,
  currentVersion,
  activating,
  deletingVersion,
  onActivate,
  onDelete,
  onDownload,
  accent,
}: VersionListProps) {
  const accentStyle = accent ? { bg: `${accent}22`, color: accent, border: `${accent}33` } : null;
  return (
    <div className="space-y-1">
      {versions.map((v) => {
        const isCurrent = v.index === currentVersion;
        const isActivating = activating === v.index;
        const isDeleting = deletingVersion === v.index;
        const date = new Date(v.createdAt);
        return (
          <div
            key={v.index}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${
              isCurrent
                ? accentStyle
                  ? ''
                  : 'border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-900/10'
                : 'border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700'
            }`}
            style={
              isCurrent && accentStyle
                ? { borderColor: accentStyle.border, backgroundColor: accentStyle.bg }
                : undefined
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              {isCurrent ? (
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${accentStyle ? '' : 'text-purple-400 dark:text-purple-300'}`}
                  style={accentStyle ? { color: accentStyle.color } : undefined}
                />
              ) : (
                <Clock className="w-4 h-4 shrink-0 text-stone-300 dark:text-stone-600" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-sm ${isCurrent ? 'font-medium text-stone-800 dark:text-stone-200' : 'text-stone-600 dark:text-stone-400'}`}
                  >
                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {isCurrent && (
                    <span
                      className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${accentStyle ? '' : 'bg-purple-200 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300'}`}
                      style={accentStyle ? { backgroundColor: accentStyle.bg, color: accentStyle.color } : undefined}
                    >
                      Online
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
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        <FileUp className="w-3 h-3" />
                        Upload
                      </span>
                    </Tooltip>
                  ) : null}
                </div>
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  {(v.size / 1024).toFixed(1)} KB · {relativeTime(v.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 ml-2 shrink-0">
              <Tooltip content="Download">
                <button
                  type="button"
                  onClick={() => onDownload(v.index)}
                  className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content={isCurrent ? 'Cannot delete active version' : 'Delete'}>
                <button
                  type="button"
                  onClick={() => onDelete(v.index)}
                  disabled={isDeleting || isCurrent}
                  className={`p-1.5 text-stone-700 dark:text-stone-300 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-auto disabled:hover:bg-transparent dark:disabled:hover:bg-transparent disabled:hover:text-stone-700 dark:disabled:hover:text-stone-300 ${!isCurrent ? 'hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </Tooltip>
              <Tooltip content={isCurrent ? 'Already active' : 'Activate'}>
                <button
                  type="button"
                  onClick={() => onActivate(v.index)}
                  disabled={isActivating || isCurrent}
                  className="ml-1 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-auto bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:hover:bg-stone-100 dark:disabled:hover:bg-stone-800"
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
