import React, { useCallback, useMemo, memo } from 'react';

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

const TableHeader = memo<{ columns: Column<any>[]; hasActions: boolean }>(({ columns, hasActions }) => (
  <thead>
    <tr className="bg-gray-100 border-b border-gray-200">
      {columns.map((col) => (
        <th key={String(col.key)} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
          {col.label}
        </th>
      ))}
      {hasActions && <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>}
    </tr>
  </thead>
));
TableHeader.displayName = 'TableHeader';
const TableRow = memo<{
  row: any;
  columns: Column<any>[];
  actions?: (row: any) => React.ReactNode;
  onRowClick?: (row: any) => void;
  striped: boolean;
  hoverable: boolean;
  idx: number;
}>(({ row, columns, actions, onRowClick, striped, hoverable, idx }) => (
  <tr
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
));
TableRow.displayName = 'TableRow';

const LoadingRow = memo<{ colSpan: number }>(({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-8 text-center text-gray-500">
      Loading...
    </td>
  </tr>
));
LoadingRow.displayName = 'LoadingRow';

const ErrorRow = memo<{ colSpan: number; error: string }>(({ colSpan, error }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-8 text-center text-red-600">
      {error}
    </td>
  </tr>
));
ErrorRow.displayName = 'ErrorRow';

const EmptyRow = memo<{ colSpan: number; emptyTitle: string; emptyMessage: string }>(
  ({ colSpan, emptyTitle, emptyMessage }) => (
    <tr>
      <td colSpan={colSpan} className="px-6 py-8 text-center text-gray-500">
        <div className="font-semibold">{emptyTitle}</div>
        {emptyMessage && <div className="text-sm mt-1">{emptyMessage}</div>}
      </td>
    </tr>
  )
);
EmptyRow.displayName = 'EmptyRow';

// Memoized pagination controls
const PaginationControls = memo<{
  page: number;
  totalPages: number;
  pages: number[];
  dataLength: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}>(({ page, totalPages, pages, dataLength, limit, total, onPageChange }) => {
  const handlePrev = useCallback(() => {
    onPageChange(Math.max(1, page - 1));
  }, [page, onPageChange]);

  const handleNext = useCallback(() => {
    onPageChange(Math.min(totalPages, page + 1));
  }, [page, totalPages, onPageChange]);

  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <div>
        Showing {dataLength === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
      </div>
      <div className="flex gap-1">
        <button
          onClick={handlePrev}
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
              p === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-2 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
});
PaginationControls.displayName = 'PaginationControls';

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
  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);
  const colSpan = useMemo(() => columns.length + (actions ? 1 : 0), [columns.length, actions]);

  const tableBody = useMemo(() => {
    if (loading) return <LoadingRow colSpan={colSpan} />;
    if (error) return <ErrorRow colSpan={colSpan} error={error} />;
    if (data.length === 0) return <EmptyRow colSpan={colSpan} emptyTitle={emptyTitle} emptyMessage={emptyMessage} />;
    
    return data.map((row, idx) => (
      <TableRow
        key={row.id}
        row={row}
        columns={columns}
        actions={actions}
        onRowClick={onRowClick}
        striped={striped}
        hoverable={hoverable}
        idx={idx}
      />
    ));
  }, [loading, error, data, columns, actions, onRowClick, striped, hoverable, colSpan, emptyTitle, emptyMessage]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="w-full">
          <TableHeader columns={columns} hasActions={!!actions} />
          <tbody>{tableBody}</tbody>
        </table>
      </div>

      {showPagination && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          pages={pages}
          dataLength={data.length}
          limit={limit}
          total={total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export default memo(Table) as typeof Table;
