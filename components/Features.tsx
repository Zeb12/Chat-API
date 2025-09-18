import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { CogIcon } from './icons/CogIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { CheckIcon } from './icons/CheckIcon';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Visual Components for each feature
const NoCodeSetupVisual = () => (
  <div className="p-8 bg-slate-100 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 aspect-[4/3] flex flex-col justify-center items-center">
    <div className="flex justify-center items-center">
      <div className="flex items-center">
        <div className="relative text-white">
          <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-full"><CheckIcon className="w-6 h-6"/></div>
          <p className="text-xs text-gray-600 dark:text-gray-300 absolute -bottom-6 left-1/2 -translate-x-1/2 w-max">Info</p>
        </div>
        <div className="h-1 w-12 sm:w-20 bg-primary"></div>
        <div className="relative">
          <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-primary rounded-full">
            <span className="h-3 w-3 bg-primary rounded-full"></span>
          </div>
          <p className="text-xs font-bold text-primary absolute -bottom-6 left-1/2 -translate-x-1/2 w-max">Appearance</p>
        </div>
        <div className="h-1 w-12 sm:w-20 bg-gray-200 dark:bg-gray-600"></div>
        <div className="relative text-gray-400">
          <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400 absolute -bottom-6 left-1/2 -translate-x-1/2 w-max">FAQs</p>
        </div>
      </div>
    </div>
    <p className="text-center mt-10 font-semibold text-gray-700 dark:text-gray-300">Guided step-by-step setup.</p>
  </div>
);

const AiSuggestionsVisual = () => (
  <div className="p-8 bg-slate-100 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 aspect-[4/3] flex flex-col justify-center">
    <div className="flex items-center gap-2">
      <SparklesIcon className="w-6 h-6 text-primary"/>
      <p className="font-semibold text-gray-700 dark:text-gray-300">Auto-generate FAQs</p>
    </div>
    <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-inner">
      <p className="text-sm text-gray-400 truncate">https://your-awesome-website.com</p>
    </div>
    <div className="mt-4 space-y-3">
      <div className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm opacity-0 animate-fade-in" style={{animationDelay: '200ms', animationFillMode: 'forwards'}}>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">What is your return policy?</p>
      </div>
      <div className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm opacity-0 animate-fade-in" style={{animationDelay: '400ms', animationFillMode: 'forwards'}}>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">How long does shipping take?</p>
      </div>
    </div>
  </div>
);

const CustomizablePersonalityVisual = () => (
  <div className="p-8 bg-slate-100 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 aspect-[4/3] flex flex-col justify-center space-y-4">
      <div className="flex items-start gap-3 opacity-0 animate-fade-in" style={{animationDelay: '200ms', animationFillMode: 'forwards'}}>
          <div className="p-2 bg-primary rounded-full text-white flex-shrink-0"><CogIcon className="w-5 h-5"/></div>
          <div className="p-3 rounded-lg bg-violet-100 dark:bg-violet-900/50 text-sm">
              <p className="font-bold text-gray-800 dark:text-gray-200">Formal:</p>
              <p className="text-gray-600 dark:text-gray-300">"Greetings. How may I be of assistance today?"</p>
          </div>
      </div>
      <div className="flex items-start gap-3 opacity-0 animate-fade-in" style={{animationDelay: '400ms', animationFillMode: 'forwards'}}>
          <div className="p-2 bg-primary rounded-full text-white flex-shrink-0"><CogIcon className="w-5 h-5"/></div>
          <div className="p-3 rounded-lg bg-violet-100 dark:bg-violet-900/50 text-sm">
              <p className="font-bold text-gray-800 dark:text-gray-200">Witty:</p>
              <p className="text-gray-600 dark:text-gray-300">"What's cooking? Let me know how I can help!"</p>
          </div>
      </div>
  </div>
);

const LeadGenerationVisual = () => (
  <div className="p-8 bg-slate-100 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 aspect-[4/3] flex flex-col justify-center">
      <div className="space-y-3">
          <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-600 text-sm max-w-[80%] opacity-0 animate-slide-up" style={{animationDelay: '200ms', animationFillMode: 'forwards'}}>"I can't seem to find an answer to that. Can I get your email so a team member can follow up?"</div>
          <div className="p-3 rounded-lg bg-primary text-white text-sm max-w-[80%] ml-auto opacity-0 animate-slide-up" style={{animationDelay: '400ms', animationFillMode: 'forwards'}}>"Sure, it's lead@example.com"</div>
          <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-600 text-sm max-w-[80%] opacity-0 animate-slide-up" style={{animationDelay: '600ms', animationFillMode: 'forwards'}}>"Great! We'll be in touch soon. ✅"</div>
      </div>
  </div>
);

const MultilingualSupportVisual = () => (
  <div className="p-8 bg-slate-100 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center aspect-[4/3] flex flex-col justify-center items-center">
      <LanguageIcon className="w-20 h-20 text-primary mx-auto"/>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
          <span className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">Hello</span>
          <span className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">Hola</span>
          <span className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">Bonjour</span>
          <span className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">こんにちは</span>
      </div>
  </div>
);

const EasyEmbeddingVisual = () => (
  <div className="p-8 bg-slate-100 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 aspect-[4/3] flex flex-col sm:flex-row items-center justify-center gap-4">
      <div className="flex-1">
          <pre className="text-xs bg-gray-900 text-green-300 p-3 rounded-md"><code>&lt;script src="..."&gt;&lt;/script&gt;</code></pre>
          <p className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400">Just one line of code.</p>
      </div>
      <div className="text-3xl text-gray-400 animate-pulse">&rarr;</div>
      <div className="relative w-40 h-32 bg-white dark:bg-gray-700 rounded-md shadow-inner flex items-end justify-end p-2">
          <div className="w-10 h-10 bg-primary rounded-full shadow-lg"></div>
      </div>
  </div>
);

const features = [
    {
        name: 'Effortless No-Code Setup',
        description: 'You don\'t need to be a developer to build a powerful chatbot. Our intuitive wizard guides you through every step, from design to deployment, with zero coding required.',
        icon: ClipboardDocumentCheckIcon,
        visual: <NoCodeSetupVisual />,
    },
    {
        name: 'Let AI Do the Heavy Lifting',
        description: "Just drop in your website URL and watch as our AI scans your content to instantly generate relevant FAQs. Go from zero to a helpful chatbot in seconds.",
        icon: SparklesIcon,
        visual: <AiSuggestionsVisual />,
    },
    {
        name: "Speak Your Brand's Language",
        description: "Your brand isn't boring, so why should your chatbot be? Select from a range of personalities—from witty and humorous to strictly professional—to create a bot that truly represents you.",
        icon: CogIcon,
        visual: <CustomizablePersonalityVisual />,
    },
    {
        name: 'Never Miss a Lead',
        description: "Turn every conversation into an opportunity. When your chatbot can't answer a question, it intelligently captures the visitor's contact details so your human team can follow up.",
        icon: UserPlusIcon,
        visual: <LeadGenerationVisual />,
    },
    {
        name: 'Connect with a Global Audience',
        description: "Break down language barriers effortlessly. Our chatbot understands and responds in multiple languages, making your business accessible to customers from all over the world.",
        icon: LanguageIcon,
        visual: <MultilingualSupportVisual />,
    },
    {
        name: 'Live on Your Site in Minutes',
        description: "No complex development cycles. We give you one simple line of code to copy and paste. Add it to your website, and your new AI assistant is ready for your customers.",
        icon: CodeBracketIcon,
        visual: <EasyEmbeddingVisual />,
    },
];

const FeatureItem: React.FC<{ feature: typeof features[0], index: number }> = ({ feature, index }) => {
    const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
    return (
        <div 
          ref={ref} 
          className={`flex flex-col-reverse lg:flex-row items-center gap-y-12 gap-x-16 lg:gap-x-24 scroll-animate ${isVisible ? 'is-visible' : ''}`}
          style={{ transitionDelay: `${100 + index * 100}ms` }}
        >
            {/* Text content (1/2 width) */}
            <div className={`lg:w-1/2 text-center lg:text-left ${index % 2 !== 0 ? 'lg:order-last' : ''}`}>
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 rounded-xl mb-4">
                    <feature.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">{feature.name}</h3>
                <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
            {/* Visual content (1/2 width) */}
            <div className="lg:w-1/2 w-full max-w-md lg:max-w-none">
                {feature.visual}
            </div>
        </div>
    );
};

export const Features: React.FC = () => {
  const [titleRef, isTitleVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.5 });
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref={titleRef} className={`mx-auto max-w-2xl lg:text-center scroll-animate ${isTitleVisible ? 'is-visible' : ''}`}>
          <h2 className="text-base font-semibold leading-7 text-primary">Everything You Need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            A Better Way to Build a Chatbot
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Our platform is designed to be incredibly simple yet powerful, giving you a world-class AI chatbot with just a few clicks.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-none space-y-20 sm:mt-20 lg:mt-24 lg:space-y-28">
          {features.map((feature, index) => (
            <FeatureItem key={feature.name} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};