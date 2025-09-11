
import React from 'react';
import { BotIcon } from './icons/BotIcon';
import { PlusIcon } from './icons/PlusIcon';

interface EmptyStateProps {
  onActionClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onActionClick }) => {
  return (
    <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 animate-fade-in">
      <BotIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
      <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No chatbots yet</h3>
      <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Get started by creating your first AI chatbot.</p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create New Chatbot
        </button>
      </div>
    </div>
  );
};
