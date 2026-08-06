import React from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  
  // Pagination
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;

  // Sorting
  sortColumn?: string;
  sortAscending?: boolean;
  onSortChange?: (column: string, ascending: boolean) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyTitle,
  emptyDescription,
  page,
  pageSize,
  totalCount = 0,
  onPageChange,
  sortColumn,
  sortAscending,
  onSortChange,
}: DataTableProps<T>) {
  
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSortChange) return;
    
    const key = column.sortKey || (typeof column.accessor === 'string' ? (column.accessor as string) : '');
    if (!key) return;

    const isCurrent = sortColumn === key;
    const nextAscending = isCurrent ? !sortAscending : true;
    onSortChange(key, nextAscending);
  };

  const totalPages = pageSize ? Math.ceil(totalCount / pageSize) : 0;

  return (
    <div className="w-full border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
      {/* Table grid wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200/50 dark:border-slate-800/50">
            <tr>
              {columns.map((col, idx) => {
                const isSortable = col.sortable && onSortChange;
                const key = col.sortKey || (typeof col.accessor === 'string' ? (col.accessor as string) : '');
                const isCurrentSort = sortColumn === key;
                
                return (
                  <th
                    key={idx}
                    onClick={() => isSortable && handleSort(col)}
                    className={`px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none ${
                      isSortable ? 'cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-950/40' : ''
                    } ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {isSortable && isCurrentSort && (
                        sortAscending ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <LoadingState type="table" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors"
                >
                  {columns.map((col, colIdx) => {
                    const content =
                      typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : row[col.accessor as string];
                    return (
                      <td
                        key={colIdx}
                        className={`px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium ${col.className || ''}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!loading && page && pageSize && totalCount > 0 && onPageChange && (
        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/10 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-300">{(page - 1) * pageSize + 1}</span> -{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.min(page * pageSize, totalCount)}
            </span>{' '}
            dari <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount}</span> data
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              const isCurrent = page === pNum;
              return (
                <button
                  key={idx}
                  onClick={() => onPageChange(pNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default DataTable;
