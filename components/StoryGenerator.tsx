import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { CubeIcon } from './icons/CubeIcon';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';
import { FaceSmileIcon } from './icons/FaceSmileIcon';

interface StoryGeneratorProps {
    onGenerate: (prompt: string, style: string) => void;
    isLoading: boolean;
    result: { story: string; imageUrl: string } | null;
    onBack: () => void;
}

const artStyles = [
    { name: 'Fantasy Art', icon: <PaintBrushIcon className="w-8 h-8" /> },
    { name: 'Cartoon', icon: <FaceSmileIcon className="w-8 h-8" /> },
    { name: 'Sci-Fi', icon: <RocketLaunchIcon className="w-8 h-8" /> },
    { name: 'Pixel Art', icon: <CubeIcon className="w-8 h-8" /> },
];

export const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onGenerate, isLoading, result, onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState(artStyles[0].name);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt, style);
        }
    };

    const handleStartOver = () => {
        setPrompt('');
        // The result itself is managed by the parent App component,
        // so we just need to navigate back to clear it.
        onBack();
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">AI Story & Image Generator</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Bring your ideas to life. Describe your characters and a setting, and let AI write a short story and create a unique illustration for you.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column: Controls */}
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="story-prompt" className="block text-lg font-bold text-gray-800 dark:text-gray-200">1. Write your prompt</label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Be descriptive! Mention characters, actions, and the environment.</p>
                            <textarea
                                id="story-prompt"
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm transition dark:text-white"
                                placeholder="e.g., A brave knight and a friendly dragon sharing a cup of tea on a mountaintop."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-bold text-gray-800 dark:text-gray-200">2. Choose an art style</label>
                             <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {artStyles.map((artStyle) => (
                                    <button
                                        key={artStyle.name}
                                        type="button"
                                        onClick={() => setStyle(artStyle.name)}
                                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-2 ${style === artStyle.name ? 'border-primary bg-violet-50 dark:bg-violet-900/50 shadow-lg scale-105' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:border-primary-light hover:shadow-md'}`}
                                    >
                                        <div className="text-primary">{artStyle.icon}</div>
                                        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{artStyle.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                           <button type="submit" disabled={isLoading} className="w-full inline-flex items-center justify-center px-6 py-4 text-lg font-semibold text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-wait">
                              {isLoading ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <SparklesIcon className="w-6 h-6 mr-3" />
                                  Generate Story & Image
                                </>
                              )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Result */}
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center min-h-[500px]">
                    {isLoading ? (
                        <div className="w-full space-y-6 animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square w-full"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="w-full animate-fade-in text-left">
                            <img src={result.imageUrl} alt="AI generated illustration of the story" className="w-full rounded-lg shadow-md mb-6 aspect-square object-cover" />
                            <p className="text-gray-700 dark:text-gray-300 prose dark:prose-invert">{result.story}</p>
                             <button onClick={handleStartOver} className="mt-8 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                                &larr; Start a new story
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 dark:text-gray-500">
                            <BookOpenIcon className="w-24 h-24 mx-auto"/>
                            <p className="mt-4 font-semibold">Your generated story will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
             <button onClick={onBack} className="block mx-auto mt-8 px-6 py-2 text-sm font-semibold text-primary hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg transition-colors">
                &larr; Back to Dashboard
            </button>
        </div>
    );
};