import React from 'react';

export interface SkeletonProps {
  className?: string;
  count?: number;
}

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700/60 ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5 shadow-2xs space-y-3 ${className}`}>
    <div className="flex items-center justify-between">
      <SkeletonBox className="h-4 w-28" />
      <SkeletonBox className="h-8 w-8 rounded-xl" />
    </div>
    <SkeletonBox className="h-7 w-20" />
    <SkeletonBox className="h-3 w-40" />
  </div>
);

export const SkeletonStats: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className = '',
}) => (
  <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => (
  <div className={`rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs ${className}`}>
    {/* Table Header */}
    <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
      <SkeletonBox className="h-5 w-36" />
      <SkeletonBox className="h-8 w-24" />
    </div>
    {/* Table Rows */}
    <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="p-4 flex items-center gap-4">
          <SkeletonBox className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, cIdx) => (
              <SkeletonBox key={cIdx} className={`h-4 ${cIdx === 0 ? 'w-3/4' : 'w-1/2'}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className = '',
}) => (
  <div className={`space-y-2.5 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 flex-1">
          <SkeletonBox className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <SkeletonBox className="h-4 w-1/3" />
            <SkeletonBox className="h-3 w-1/2" />
          </div>
        </div>
        <SkeletonBox className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);
