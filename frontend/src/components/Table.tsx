import React from 'react';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  limit: number;
  total: number;
  loading?: boolean;
  error?: string | null;
  onPageChange: (page: number) => void;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  showPagination?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
}

function Table<T extends { id: number }>({
  columns,
  data,
  page,
  limit,
  total,
  loading = false,
  error = null,
  onPageChange,
  onRowClick,
  actions,
  showPagination = true,
  emptyTitle = 'No data available',
  emptyMessage = '',
  striped = false,
  hoverable = false,
}: TableProps<T>) {
  const totalPages = Math.ceil(total / limit) || 1;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {columns.map((col) => (
                <th key={String(col.key)} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                  <div className="font-semibold">{emptyTitle}</div>
                  {emptyMessage && <div className="text-sm mt-1">{emptyMessage}</div>}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-200 ${hoverable ? 'hover:bg-gray-50 transition-colors cursor-pointer' : ''} ${striped && idx % 2 === 1 ? 'bg-gray-50' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-700">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                    </td>
                  ))}
                  {actions && <td className="px-6 py-4 text-sm">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {data.length === 0 ? 0 : (page - 1) * limit + 1} to{' '}
            {Math.min(page * limit, total)} of {total}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-2 rounded ${
                  p === page
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
