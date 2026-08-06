import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'spinner' | 'table' | 'card';
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ type = 'spinner', rows = 5 }) => {
  if (type === 'table') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        {/* Table Header skeleton */}
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full"></div>
        {/* Table Rows skeleton */}
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex gap-4 items-center">
            <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg w-1/4"></div>
            <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg w-1/4"></div>
            <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg w-1/3"></div>
            <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg w-1/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="w-full p-6 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-900 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
        <div className="h-24 bg-slate-100 dark:bg-slate-900 rounded-xl w-full"></div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
      <span className="text-xs font-semibold tracking-wider">Memuat data...</span>
    </div>
  );
};
export default LoadingState;
