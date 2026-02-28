import React from 'react';

interface LoadingStateProps {
  rows?: number;
  columns?: number;
  message?: string;
}

function LoadingState({ rows = 6, columns = 5, message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 px-4 bg-gray-50 rounded animate-pulse">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="flex-1 h-4 bg-gray-200 rounded" />
          ))}
        </div>
      ))}
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export default LoadingState;
