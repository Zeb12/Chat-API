import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { InfoCircleIcon } from './icons/InfoCircleIcon';
import { XIcon } from './icons/XIcon';

interface OnboardingTourProps {
    onComplete: () => void;
}

type TourStep = {
    targetId: string;
    title: string;
    content: string;
    position: 'bottom' | 'bottom-start' | 'bottom-end' | 'top';
};

const TOUR_STEPS: TourStep[] = [
    {
        targetId: 'new-chatbot-button',
        title: 'Create Your First Chatbot',
        content: "This is where the magic begins! Click here to start building and customizing a new AI chatbot for your website.",
        position: 'bottom-end',
    },
    {
        targetId: 'chatbot-list',
        title: 'Your Chatbot Dashboard',
        content: 'All of your created chatbots will appear here. You can manage them, view their performance, and get their embed scripts.',
        position: 'bottom',
    },
    {
        targetId: 'upgrade-button',
        title: 'Manage Your Plan',
        content: "Your current plan is shown here. You can upgrade at any time to unlock more powerful features and increase your chatbot limits.",
        position: 'bottom-end',
    }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [style, setStyle] = useState({});

    const updateHighlight = useCallback(() => {
        const step = TOUR_STEPS[currentStep];
        const element = document.querySelector(`[data-tour-id="${step.targetId}"]`);
        
        if (element) {
            const rect = element.getBoundingClientRect();
            setStyle({
                '--highlight-width': `${rect.width}px`,
                '--highlight-height': `${rect.height}px`,
                '--highlight-top': `${rect.top}px`,
                '--highlight-left': `${rect.left}px`,
            });
        }
    }, [currentStep]);

    useLayoutEffect(() => {
        updateHighlight();
        window.addEventListener('resize', updateHighlight);
        return () => window.removeEventListener('resize', updateHighlight);
    }, [updateHighlight]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = TOUR_STEPS[currentStep];

    const getModalPosition = () => {
        const element = document.querySelector(`[data-tour-id="${step.targetId}"]`);
        if (!element) return {};

        const rect = element.getBoundingClientRect();
        const modalWidth = 320; // Corresponds to w-80
        const gap = 16;
        
        const positions = {
            'bottom': { top: rect.bottom + gap, left: rect.left + rect.width / 2 - modalWidth / 2 },
            'bottom-start': { top: rect.bottom + gap, left: rect.left },
            'bottom-end': { top: rect.bottom + gap, left: rect.right - modalWidth },
            'top': { top: rect.top - gap, left: rect.left + rect.width / 2 - modalWidth / 2, transform: 'translateY(-100%)' },
        };

        let pos = positions[step.position];

        // Adjust for viewport edges
        if (pos.left < gap) pos.left = gap;
        if (pos.left + modalWidth > window.innerWidth - gap) {
            pos.left = window.innerWidth - modalWidth - gap;
        }

        return pos;
    };

    return (
        <div 
            className="fixed inset-0 z-[100] transition-opacity duration-300"
            style={{
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                clipPath: 'polygon(0% 0%, 0% 100%, var(--highlight-left) 100%, var(--highlight-left) var(--highlight-top), calc(var(--highlight-left) + var(--highlight-width)) var(--highlight-top), calc(var(--highlight-left) + var(--highlight-width)) calc(var(--highlight-top) + var(--highlight-height)), var(--highlight-left) calc(var(--highlight-top) + var(--highlight-height)), var(--highlight-left) 100%, 100% 100%, 100% 0%)',
                ...style
            }}
        >
            <div 
                className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80 animate-fade-in transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700"
                style={getModalPosition()}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <InfoCircleIcon className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>
                    </div>
                    <button onClick={onComplete} className="p-1 -mt-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{step.content}</p>
                <div className="mt-6 flex justify-between items-center">
                    <button onClick={onComplete} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">Skip</button>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{currentStep + 1} / {TOUR_STEPS.length}</span>
                        {currentStep > 0 && (
                            <button onClick={handlePrev} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                                Back
                            </button>
                        )}
                        <button onClick={handleNext} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark">
                            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
