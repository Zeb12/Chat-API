
import React, { useState } from 'react';
import { EmbeddedPreview } from './EmbeddedPreview';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface ChatbotPreviewModalProps {
  script: string;
  onClose: () => void;
  botName: string;
}

export const ChatbotPreviewModal: React.FC<ChatbotPreviewModalProps> = ({ script, onClose, botName }) => {
  const [copyStatus, copy] = useCopyToClipboard();
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl w-full m-4 transform transition-all animate-slide-up flex flex-col h-[90vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 id="preview-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
            Preview: <span className="text-primary">{botName}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close preview"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 flex justify-center flex-shrink-0">
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

        <div className="flex-grow min-h-0">
          {activeTab === 'preview' && (
            <div className="animate-fade-in h-full">
              <EmbeddedPreview script={script} />
            </div>
          )}
          {activeTab === 'code' && (
            <div className="animate-fade-in text-left h-full flex flex-col">
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-sm flex-shrink-0">Copy and paste this script tag just before the closing `&lt;/body&gt;` tag on your website.</p>
              <div className="relative bg-gray-900 rounded-lg p-4 flex-grow flex flex-col min-h-0">
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
    </div>
  );
};
