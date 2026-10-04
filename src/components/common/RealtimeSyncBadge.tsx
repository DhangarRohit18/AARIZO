import React from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import type { SyncState } from '../../hooks/useFirestoreRealtime';

export interface RealtimeSyncBadgeProps {
  status?: SyncState | 'live' | 'syncing' | 'offline';
  state?: SyncState | 'live' | 'syncing' | 'offline';
  label?: string;
  onReconnect?: () => void;
  className?: string;
  showText?: boolean;
}

export const RealtimeSyncBadge: React.FC<RealtimeSyncBadgeProps> = ({
  status,
  state,
  label,
  onReconnect,
  className = '',
  showText = true,
}) => {
  const rawState = (state || status || 'LIVE').toUpperCase();
  const effectiveStatus: SyncState = rawState === 'LIVE' ? 'LIVE' : rawState === 'SYNCING' ? 'SYNCING' : 'OFFLINE';

  if (effectiveStatus === 'LIVE') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold shadow-2xs select-none ${className}`}
        title="Real-time Firestore sync active"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        {showText && <span>{label || 'LIVE'}</span>}
      </div>
    );
  }

  if (status === 'SYNCING') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold shadow-2xs select-none ${className}`}
        title="Syncing changes with Firestore..."
      >
        <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
        {showText && <span>SYNCING</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onReconnect}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 text-[11px] font-bold hover:bg-slate-500/20 transition-colors cursor-pointer select-none ${className}`}
      title="Offline mode / Local fallback active. Click to reconnect."
    >
      <WifiOff className="w-3 h-3 text-slate-500" />
      {showText && <span>OFFLINE</span>}
      {onReconnect && <RefreshCw className="w-2.5 h-2.5 ml-0.5 opacity-60" />}
    </button>
  );
};
