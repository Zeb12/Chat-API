import React from 'react';

export const ConfigurationNeeded: React.FC = () => {
  const codeSnippet = `
// File: services/geminiService.ts

// 1. Find your Supabase Project URL and Anon Key
//    in your Supabase Dashboard under:
//    Project Settings > API

// 2. Replace the placeholder values below:
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
  `;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border border-red-200/80 dark:border-red-500/30 text-center animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Action Required: Configure Supabase</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
          This application needs to connect to your Supabase project to function correctly.
        </p>
        <div className="text-gray-700 dark:text-gray-300 text-left mb-4 bg-slate-50 dark:bg-gray-700/50 p-6 rounded-lg border border-slate-200 dark:border-gray-700">
          <p className="mb-4 font-semibold text-lg text-gray-800 dark:text-gray-100">
            Follow these steps:
          </p>
          <ol className="list-decimal list-inside space-y-3">
            <li>
              Open the file: <code className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-mono text-sm py-1 px-1.5 rounded-md">services/geminiService.ts</code>
            </li>
            <li>
              Replace the placeholder values for <code className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-mono text-sm py-1 px-1.5 rounded-md">supabaseUrl</code> and <code className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-mono text-sm py-1 px-1.5 rounded-md">supabaseAnonKey</code> with your actual project credentials.
            </li>
            <li>
              <strong>Save the file</strong> and <strong>refresh your browser</strong>. The app's dev server should automatically apply the changes, but a manual refresh can help.
            </li>
          </ol>

          <div className="relative bg-gray-900 rounded-lg p-4 text-left my-6">
            <pre className="text-sm text-gray-200 overflow-x-auto">
              <code>
                {codeSnippet.trim()}
              </code>
            </pre>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-bold text-gray-600 dark:text-gray-300">Where to find them:</span> You can find both the URL and the <span className="font-bold">anon</span> key in your Supabase project dashboard under <span className="font-semibold text-gray-600 dark:text-gray-300">Project Settings &gt; API</span>.
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md border border-yellow-200 dark:border-yellow-500/30">
            <strong>Important:</strong> Please use the <span className="font-semibold">anon</span> key, not the <span className="font-semibold">publishable</span> key or the <span className="font-semibold">service_role</span> key. The application will not authenticate correctly otherwise.
          </p>
        </div>
      </div>
    </div>
  );
};