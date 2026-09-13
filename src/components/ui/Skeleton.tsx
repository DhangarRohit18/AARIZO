import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3"></div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="p-4 bg-slate-50 dark:bg-slate-950 flex gap-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex justify-between gap-4">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/5"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={4} />
    </div>
  );
};
