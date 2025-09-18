import React, { useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface PaymentSuccessProps {
  onComplete: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000); // 5-second delay before redirecting

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface dark:bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in text-center">
      <CheckCircleIcon className="w-20 h-20 mx-auto text-green-500" />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-6">
        Payment Successful!
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-3">
        Thank you for your subscription. Your account has been upgraded.
      </p>
      <div className="mt-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You will be automatically redirected to your dashboard shortly.
        </p>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full animate-progress"
          ></div>
        </div>
      </div>
    </div>
  );
};
