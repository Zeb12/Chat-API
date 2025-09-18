import React from 'react';
import { ChatbotDemo } from './ChatbotDemo';
import { CountdownTimer } from './CountdownTimer';

interface HeroProps {
  onGetStarted: () => void;
  onNavigateToTerms: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted, onNavigateToTerms }) => {
  return (
    <div className="relative animate-fade-in pt-20">
      <div className="grid lg:grid-cols-5 lg:gap-x-12 xl:gap-x-16 items-center">
        {/* Left Column: Text Content */}
        <div className="text-center lg:text-left lg:col-span-2">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center lg:justify-start">
              <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-gray-600 dark:text-gray-300 ring-1 ring-gray-900/10 dark:ring-white/10 hover:ring-gray-900/20 dark:hover:ring-white/20">
                  <span className="font-semibold text-primary">⭐</span> Trusted by 1000+ businesses worldwide
              </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-7xl">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Chatbot</span>
            {' '}for Your{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Business</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
            Instantly answer customer questions, <span className="font-semibold text-primary">generate leads</span>, and boost sales 24/7. Our <span className="font-semibold text-primary">no-code platform</span> lets you build and embed a custom AI chatbot on your website in <span className="font-semibold text-primary">just minutes</span>.
          </p>
          <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
              <button
                  onClick={onGetStarted}
                  className="rounded-lg bg-gradient-to-r from-primary-light to-primary px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-primary hover:to-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 hover:scale-105 sm:px-8 sm:py-4"
              >
                  Get Started <span aria-hidden="true">&rarr;</span>
              </button>
          </div>
          <div className="mt-10">
            <CountdownTimer />
          </div>
          <div className="mt-8 text-center lg:text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
                  ChatBot Studio was created to empower businesses of all sizes with the latest AI technology, making advanced customer engagement simple and accessible. Read our{' '}
                  <button onClick={onNavigateToTerms} className="font-semibold text-primary hover:underline focus:outline-none">
                      Terms of Service
                  </button>.
              </p>
          </div>
        </div>

        {/* Right Column: Chatbot Demo */}
        <div className="mt-12 lg:mt-0 lg:col-span-3">
          <ChatbotDemo />
        </div>
      </div>
    </div>
  );
};