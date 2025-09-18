import React from 'react';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusIcon } from './icons/PlusIcon';

interface OnboardingGuideProps {
  chatbotsCount: number;
  onCreateNewChatbot: () => void;
  onDismiss: () => void;
}

type Step = {
  title: string;
  description: string;
  isComplete: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
};

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ chatbotsCount, onCreateNewChatbot, onDismiss }) => {
  const steps: Step[] = [
    {
      title: 'Create Your First AI Chatbot',
      description: 'Start by building a new chatbot with our guided wizard.',
      isComplete: chatbotsCount > 0,
      action: {
        label: 'Create Chatbot',
        handler: onCreateNewChatbot,
      },
    },
    {
      title: 'Add Your Business Info & FAQs',
      description: 'Give your chatbot the knowledge it needs to help customers.',
      isComplete: false, 
    },
    {
      title: 'Embed on Your Website',
      description: 'Grab the script and add it to your site in minutes.',
      isComplete: false,
    },
  ];

  const completedSteps = chatbotsCount > 0 ? 1 : 0;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Setup Guide</h3>
        </div>
        <button onClick={onDismiss} className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Dismiss guide">
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <ul className="mt-4 space-y-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-4">
            <div className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full flex items-center justify-center ${step.isComplete ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500'}`}>
              {step.isComplete ? <CheckIcon className="w-4 h-4" /> : <span className="text-xs font-bold text-gray-500 dark:text-gray-300">{index + 1}</span>}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold text-gray-900 dark:text-white ${step.isComplete ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>{step.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              {step.action && !step.isComplete && (
                <button onClick={step.action.handler} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary dark:text-violet-300 bg-violet-100 dark:bg-violet-500/20 rounded-full hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors">
                  <PlusIcon className="w-4 h-4" />
                  {step.action.label}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};