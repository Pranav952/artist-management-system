import { useState, useCallback } from 'react';


interface UseTableOptions<T> {
  initialPage?: number;
  initialLimit?: number;
  // Fetch function that returns paginated data
  onFetch: (page: number, limit: number) => Promise<{ data: T[]; total: number }>;
}

interface UseTableReturn<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

export function useTable<T>({
  initialPage = 1,
  initialLimit = 10,
  onFetch,
}: UseTableOptions<T>): UseTableReturn<T> {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (pageNum = page, limitNum = limit) => {
      setLoading(true);
      setError(null);
      try {
        const result = await onFetch(pageNum, limitNum);
        setData(result.data);
        setTotal(result.total);
        setPage(pageNum);
        setLimit(limitNum);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [onFetch]
  );

  const handlePageChange = (newPage: number) => {
    fetchData(newPage, limit);
  };


  const handleLimitChange = (newLimit: number) => {
    fetchData(1, newLimit);
  };

  return {
    data,
    page,
    limit,
    total,
    loading,
    error,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    refetch: () => fetchData(page, limit),
  };
}

export default useTable;
