import React from 'react';
import { StripeIcon } from './icons/StripeIcon';
import { XIcon } from './icons/XIcon';

interface StripeErrorModalProps {
  error: string;
  onClose: () => void;
  onNavigateToGuide: () => void;
}

export const StripeErrorModal: React.FC<StripeErrorModalProps> = ({ error, onClose, onNavigateToGuide }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
      aria-labelledby="stripe-error-dialog-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full m-4 text-center transform transition-all animate-slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 id="stripe-error-dialog-title" className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
          Payment System Configuration Needed
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Checkout failed. This usually means the Stripe integration is not fully set up yet.
        </p>

        <div className="mt-4 text-left bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
            <p className="font-semibold text-gray-800 dark:text-gray-200">Error Details:</p>
            <code className="text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap break-words">{error}</code>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onNavigateToGuide}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <StripeIcon className="w-5 h-5 mr-2 -ml-1" />
            View Setup Guide
          </button>
        </div>
      </div>
    </div>
  );
};