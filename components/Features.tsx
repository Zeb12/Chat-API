import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { CogIcon } from './icons/CogIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';

const features = [
  {
    name: 'AI-Powered Suggestions',
    description: 'Enter your website URL and let our AI automatically generate relevant FAQs, saving you time and effort.',
    icon: SparklesIcon,
  },
  {
    name: 'Customizable Personality',
    description: 'Choose from a range of personalities—from friendly to professional—to match your brand’s unique voice and tone.',
    icon: CogIcon,
  },
  {
    name: 'No-Code Setup',
    description: 'Generate your chatbot without writing a single line of code. Our wizard guides you through every step of the process.',
    icon: CodeBracketIcon,
  },
  {
    name: 'Lead Generation',
    description: 'Configure your bot to capture user information when it can’t answer a question, turning support queries into leads.',
    icon: UserPlusIcon,
  },
  {
    name: 'Multilingual Support',
    description: 'Powered by advanced AI, your chatbot can understand and respond in multiple languages to support a global audience.',
    icon: LanguageIcon,
  },
  {
    name: 'Easy Embedding',
    description: 'Get a single, self-contained JavaScript snippet. Just copy and paste it into your website to go live instantly.',
    icon: ClipboardDocumentCheckIcon,
  },
];

export const Features: React.FC = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center animate-slide-up">
          <h2 className="text-base font-semibold leading-7 text-primary">Everything You Need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Why Choose ChatBot Pro?
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Our platform is designed to be incredibly simple yet powerful, giving you a world-class AI chatbot with just a few clicks.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={feature.name} 
                className="flex flex-col animate-slide-up"
                // Delay each card's animation. The 'backwards' fill mode ensures
                // the element is invisible until the animation starts.
                style={{ animationDelay: `${200 + index * 150}ms`, animationFillMode: 'backwards' }}
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <feature.icon className="h-7 w-7 flex-none text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};