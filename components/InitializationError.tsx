import React from 'react';

interface InitializationErrorProps {
  error: string;
}

export const InitializationError: React.FC<InitializationErrorProps> = ({ error }) => {
  const codeSnippet = `
// File: services/geminiService.ts

// Please verify these values in your Supabase Dashboard
// under Project Settings > API

const supabaseUrl = '...'; // Check for typos or extra characters
const supabaseAnonKey = '...'; // Ensure this is the 'anon' key
  `;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border border-red-200/80 dark:border-red-500/30 text-center animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Configuration Error</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
          The application failed to initialize using the Supabase credentials you provided.
        </p>
        <div className="text-gray-700 dark:text-gray-300 text-left mb-4 bg-slate-50 dark:bg-gray-700/50 p-6 rounded-lg border border-slate-200 dark:border-gray-700">
          <p className="mb-2 font-semibold text-lg text-gray-800 dark:text-gray-100">
            Error Details:
          </p>
          <code className="block bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 font-mono text-sm p-3 rounded-md mb-4 whitespace-pre-wrap">{error}</code>

          <p className="mb-4 font-semibold text-lg text-gray-800 dark:text-gray-100">
            How to Fix:
          </p>
          <ol className="list-decimal list-inside space-y-3">
            <li>
              Open the file: <code className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-mono text-sm py-1 px-1.5 rounded-md">services/geminiService.ts</code>
            </li>
            <li>
              Carefully check the values for <code className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-mono text-sm py-1 px-1.5 rounded-md">supabaseUrl</code> and <code className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-mono text-sm py-1 px-1.5 rounded-md">supabaseAnonKey</code> against your project's API settings.
            </li>
            <li>
              <strong>Common issues:</strong> a typo, an extra space, a missing character, or using the wrong key (e.g., `service_role` instead of `anon`).
            </li>
          </ol>

          <div className="relative bg-gray-900 rounded-lg p-4 text-left my-6">
            <pre className="text-sm text-gray-200 overflow-x-auto">
              <code>
                {codeSnippet.trim()}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
