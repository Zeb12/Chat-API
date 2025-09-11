import React from 'react';

interface ErrorMessageProps {
  error: string | null;
  onClear: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onClear }) => {
  if (!error) return null;

  return (
    <div
      className="fixed bottom-5 right-5 w-full max-w-md z-50 animate-slide-up"
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-red-200/80 dark:border-red-500/30 p-5 flex items-start justify-between">
        <div className="flex-shrink-0">
           <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <p className="font-bold text-gray-900 dark:text-gray-100">An Error Occurred</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{error}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClear}
            className="-mx-1.5 -my-1.5 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};