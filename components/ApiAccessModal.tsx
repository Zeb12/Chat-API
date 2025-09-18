import React, { useState } from 'react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { XIcon } from './icons/XIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

const generateApiKey = () => `cbp_live_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`;

export const ApiAccessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState(generateApiKey());
  const [copyStatus, copy] = useCopyToClipboard();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isConfirmingReveal, setIsConfirmingReveal] = useState(false);
  const [isConfirmingRegenerate, setIsConfirmingRegenerate] = useState(false);

  const handleRegenerate = () => {
    setApiKey(generateApiKey());
    setIsRevealed(false); // Hide new key by default
    setIsConfirmingRegenerate(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="api-modal-title">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full m-4 transform transition-all animate-slide-up relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Close">
            <XIcon className="w-6 h-6" />
          </button>

          <div>
            <h2 id="api-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">API Key Management</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Use this API key to interact with your chatbots programmatically. Keep your key secure and do not expose it in client-side code.
            </p>
          </div>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-gray-700/50 rounded-lg border border-gray-200/80 dark:border-gray-700">
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your API Key</label>
            <div className="mt-1 flex items-center gap-2">
              <div className="relative flex-grow">
                <input
                  id="api-key"
                  type={isRevealed ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm dark:text-white pr-10"
                />
                <button
                  onClick={() => {
                    if (isRevealed) {
                        setIsRevealed(false);
                    } else {
                        setIsConfirmingReveal(true);
                    }
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary"
                  aria-label={isRevealed ? "Hide API key" : "Reveal API key"}
                >
                  {isRevealed ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              <button
                onClick={() => copy(apiKey)}
                className={`relative flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors ${
                  copyStatus === 'copied'
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
                    : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                aria-label="Copy API key"
              >
                {copyStatus === 'copied' ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-5 h-5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Warning:</strong> Regenerating your key will immediately invalidate the old one. Any applications using the old key will stop working.
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <a href="#" className="text-sm font-semibold text-primary hover:underline">Read API Documentation &rarr;</a>
            <div className="flex gap-x-4">
              <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                Close
              </button>
              <button onClick={() => setIsConfirmingRegenerate(true)} className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700">
                <RefreshIcon className="w-5 h-5 mr-2 -ml-1" />
                Regenerate Key
              </button>
            </div>
          </div>
        </div>
      </div>

      {isConfirmingReveal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full m-4 text-center transform transition-all animate-slide-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Reveal API Key?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your API key provides direct access to your account. Do not share it publicly or commit it to version control.
            </p>
            <div className="mt-6 flex justify-center gap-x-4">
              <button onClick={() => setIsConfirmingReveal(false)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
              <button onClick={() => { setIsRevealed(true); setIsConfirmingReveal(false); }} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark">Reveal Key</button>
            </div>
          </div>
        </div>
      )}

      {isConfirmingRegenerate && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full m-4 text-center transform transition-all animate-slide-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Regenerate API Key?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Are you sure? Your old API key will be immediately invalidated. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-x-4">
              <button onClick={() => setIsConfirmingRegenerate(false)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
              <button onClick={handleRegenerate} className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700">Yes, Regenerate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};