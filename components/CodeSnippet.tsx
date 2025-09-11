import React, { useState } from 'react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { EmbeddedPreview } from './EmbeddedPreview';

interface CodeSnippetProps {
  script: string;
  onReset: () => void;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ script, onReset }) => {
  const [copyStatus, copy] = useCopyToClipboard();
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const handleResetClick = () => {
    setIsConfirmingReset(true);
  };

  const confirmReset = () => {
    onReset();
    setIsConfirmingReset(false);
  };

  const cancelReset = () => {
    setIsConfirmingReset(false);
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto text-center animate-fade-in">
        <div className="bg-surface dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700">
          <SparklesIcon className="w-12 h-12 mx-auto text-primary" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Your Chatbot is Ready!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">Use the tabs below to preview your chatbot or get the installation code.</p>
          
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 flex justify-center">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'preview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                aria-current={activeTab === 'preview' ? 'page' : undefined}
              >
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'code'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                aria-current={activeTab === 'code' ? 'page' : undefined}
              >
                Get Code
              </button>
            </nav>
          </div>

          <div className="h-[60vh] min-h-[500px] max-h-[700px]">
            {activeTab === 'preview' && (
              <div className="animate-fade-in h-full">
                <EmbeddedPreview script={script} />
              </div>
            )}
            {activeTab === 'code' && (
              <div className="animate-fade-in text-left h-full flex flex-col">
                <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-sm">Copy and paste this script tag just before the closing `&lt;/body&gt;` tag on your website.</p>
                <div className="relative bg-gray-900 rounded-lg p-4 flex-grow flex flex-col">
                  <button
                    onClick={() => copy(`<script>\n${script}\n</script>`)}
                    className="absolute top-2 right-2 bg-gray-700 text-gray-300 hover:bg-gray-600 p-2 rounded-md transition-colors z-10"
                    aria-label="Copy code"
                  >
                    {copyStatus === 'copied' ? (
                      <CheckIcon className="w-5 h-5 text-green-400" />
                    ) : (
                      <CopyIcon className="w-5 h-5" />
                    )}
                  </button>
                  <pre className="text-sm text-gray-200 overflow-auto h-full">
                    <code>
                      {`<script>\n${script}\n</script>`}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleResetClick}
          className="mt-8 px-6 py-3 text-base font-semibold text-primary hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {isConfirmingReset && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
          aria-labelledby="confirmation-dialog-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full m-4 text-center transform transition-all animate-slide-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 id="confirmation-dialog-title" className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
              Return to Dashboard?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              This will discard the current script view. Please ensure you have copied it if you want to save it.
            </p>
            <div className="mt-6 flex justify-center gap-x-4">
              <button
                type="button"
                onClick={cancelReset}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};