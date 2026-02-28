import React from 'react';

// Pagination controls with smart ellipsis for large page counts
interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  dataLength?: number; 
  maxPages?: number;
}

function Pagination({ page, limit, total, onPageChange, dataLength = 0, maxPages = 7 }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  
  if (totalPages <= 1) return null;

  let pages: number[] = [];
  if (totalPages <= maxPages) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const half = Math.floor(maxPages / 2);
    const startPage = Math.max(1, page - half);
    const endPage = Math.min(totalPages, page + half);
    
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push(-1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 1) pages.push(-1);
    if (endPage < totalPages) pages.push(totalPages);
  }


  const start = dataLength === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between text-sm text-gray-600 pt-4">
      <div className="text-sm">
        {start === 0 ? '0' : start} – {end} of {total} results
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          ← Prev
        </button>

        {pages.map((p, idx) =>
          p === -1 ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-2">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-2 rounded-md transition-colors ${
                p === page
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default Pagination;
