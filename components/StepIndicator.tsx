
import React from 'react';
import { CheckIcon } from './icons/CheckIcon';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, stepNames }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <li key={stepNames[i]} className={`relative ${i !== totalSteps - 1 ? 'pr-8 sm:pr-20' : ''}`}>
              {isCompleted ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-primary" />
                  </div>
                  <div className="relative w-8 h-8 flex items-center justify-center bg-primary rounded-full hover:bg-primary-dark">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                </>
              ) : isCurrent ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="relative w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-primary rounded-full">
                    <span className="h-2.5 w-2.5 bg-primary rounded-full" aria-hidden="true" />
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="relative w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full group-hover:border-gray-400 dark:group-hover:border-gray-500">
                     <span className="h-2.5 w-2.5 bg-transparent rounded-full" aria-hidden="true" />
                  </div>
                </>
              )}
               <div className="absolute top-10 w-max -translate-x-1/2 left-1/2 text-center">
                 <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                   {stepNames[i]}
                 </p>
               </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};