import React from 'react';

// Reusable modal form component
interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  submitText?: string;
  loading?: boolean;
}

function Modal({ isOpen, title, children, onClose, onSubmit, submitText = 'Save', loading = false }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            {onSubmit && (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Saving' : submitText}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;
