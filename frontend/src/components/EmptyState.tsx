import React from 'react';

interface EmptyStateProps {
  title?: string; 
  message?: string; 
  icon?: React.ReactNode; 
  action?: {
    label: string;
    onClick: () => void;
  }; 
}

function EmptyState({
  title = 'No Data',
  message = 'There\'s nothing here yet.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <div className="mb-4 text-4xl text-gray-400">{icon}</div>}

      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{message}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="btn mt-4"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
