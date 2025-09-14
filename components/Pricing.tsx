import React from 'react';
import { PLANS } from '../constants';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface PricingProps {
  onSubscribe: (planId: string) => void;
  isEmbedded?: boolean;
  isLoading?: boolean;
}

export const Pricing: React.FC<PricingProps> = ({ onSubscribe, isEmbedded = false, isLoading = false }) => {
  return (
    <section id="pricing" className={isEmbedded ? "py-16" : "py-24 sm:py-32"}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {isEmbedded ? 'Choose Your New Plan' : 'Simple, Transparent Pricing'}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            {isEmbedded ? 'Upgrade your account to unlock more features and build better chatbots.' : 'Choose the plan that\'s right for you. No hidden fees, ever.'}
          </p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 md:max-w-none md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                plan.featured 
                ? 'bg-gray-900 dark:bg-violet-900/30 ring-gray-900 dark:ring-violet-500' 
                : 'dark:bg-gray-800 ring-gray-200 dark:ring-gray-700'
              }`}
            >
              <h3 className={`text-lg font-semibold leading-8 ${plan.featured ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {plan.name}
              </h3>
              <p className={`mt-4 text-sm leading-6 ${plan.featured ? 'text-gray-300 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                A great plan for small businesses.
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className={`text-4xl font-bold tracking-tight ${plan.featured ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm font-semibold leading-6 ${plan.featured ? 'text-gray-300 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {plan.priceDetail}
                </span>
              </p>
              <button
                onClick={() => onSubscribe(plan.id)}
                disabled={isLoading && plan.id !== 'free'}
                aria-label={`Get started with the ${plan.name} plan for ${plan.price}`}
                className={`w-full mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                  plan.featured
                    ? 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
                    : 'bg-primary text-white shadow-sm hover:bg-primary-dark focus-visible:outline-primary'
                }`}
              >
                {isLoading && plan.id !== 'free' ? (
                  <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  plan.cta
                )}
              </button>
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 xl:mt-10 ${plan.featured ? 'text-gray-300 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckCircleIcon
                      className={`h-6 w-5 flex-none ${plan.featured ? 'text-white' : 'text-primary'}`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};