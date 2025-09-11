import React, { useState } from 'react';
import type { BusinessInfo, FAQ, Personality } from '../types';
import { PERSONALITY_DETAILS } from '../constants';
import { EXAMPLES, ExampleConfig } from '../examples';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { StepIndicator } from './StepIndicator';
import { suggestFaqsFromUrl } from '../services/geminiService';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

type SuggestedFAQ = Omit<FAQ, 'id'>;

interface ChatbotWizardProps {
  onGenerate: (config: {
    businessInfo: BusinessInfo;
    personality: Personality;
    faqs: FAQ[];
  }) => void;
  isLoading: boolean;
}

const InputField: React.FC<{ label: React.ReactNode; id: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean; disabled?: boolean; }> = ({ label, id, name, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input id={id} name={name} type="text" {...props} className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm transition dark:text-white disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-gray-700" />
    </div>
);

const TextareaField: React.FC<{ label: React.ReactNode; id: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; required?: boolean; rows?: number }> = ({ label, id, name, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <textarea id={id} name={name} {...props} className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm transition dark:text-white" />
    </div>
);

export const ChatbotWizard: React.FC<ChatbotWizardProps> = ({ onGenerate, isLoading }) => {
  const [step, setStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({ name: '', description: '', website: '' });
  const [personality, setPersonality] = useState<Personality>(PERSONALITY_DETAILS[0].type);
  const [faqs, setFaqs] = useState<FAQ[]>([{ id: crypto.randomUUID(), question: '', answer: '' }]);
  
  // State for FAQ suggestions
  const [suggestionUrl, setSuggestionUrl] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [suggestedFaqs, setSuggestedFaqs] = useState<SuggestedFAQ[]>([]);

  const handleBusinessInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBusinessInfo({ ...businessInfo, [e.target.name]: e.target.value });
  };

  const handleFaqChange = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
  };
  
  const addFaq = () => {
    setFaqs([...faqs, { id: crypto.randomUUID(), question: '', answer: '' }]);
  };

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  const handleSelectExample = (example: ExampleConfig) => {
    setBusinessInfo(example.config.businessInfo);
    setPersonality(example.config.personality);
    // Generate new UUIDs for FAQs when loading an example
    setFaqs(example.config.faqs.map(faq => ({
        ...faq,
        id: crypto.randomUUID(),
    })));
  };

  const handleGenerateSuggestions = async () => {
    if (!suggestionUrl) {
        setSuggestionError("Please enter a valid website URL.");
        return;
    }
    setIsSuggesting(true);
    setSuggestionError(null);
    setSuggestedFaqs([]);
    try {
        const suggestions = await suggestFaqsFromUrl(suggestionUrl);
        setSuggestedFaqs(suggestions);
    } catch (err: any) {
        setSuggestionError(err.message || "An unknown error occurred while generating suggestions.");
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleAddSuggestedFaq = (suggestedFaq: SuggestedFAQ) => {
    const newFaq = { ...suggestedFaq, id: crypto.randomUUID() };
    // If the first FAQ is empty, replace it. Otherwise, add the new one.
    if (faqs.length === 1 && faqs[0].question === '' && faqs[0].answer === '') {
        setFaqs([newFaq]);
    } else {
        setFaqs(prev => [...prev, newFaq]);
    }
    setSuggestedFaqs(prev => prev.filter(f => f !== suggestedFaq));
    setStep(3); // Navigate to the FAQ step to see the new addition
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ businessInfo, personality, faqs });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in">
        <div className="mb-12">
            <StepIndicator currentStep={step} totalSteps={3} stepNames={['Business Info', 'Personality', 'FAQs']} />
        </div>
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                {step === 1 && (
                    <div className="animate-slide-up space-y-12">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Start with a Template</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Or scroll down to fill out your business info from scratch.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {EXAMPLES.map(example => (
                                    <button
                                        key={example.name}
                                        type="button"
                                        onClick={() => handleSelectExample(example)}
                                        className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 text-left transition-all duration-200 hover:border-primary-light hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-light"
                                    >
                                        <SparklesIcon className="w-6 h-6 mb-2 text-primary-light" />
                                        <h3 className="font-semibold text-md text-gray-800 dark:text-gray-200">{example.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{example.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Tell us about your business</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">This information will help the chatbot answer basic questions.</p>
                            <div className="space-y-4">
                                <InputField label="Business Name" id="name" name="name" value={businessInfo.name} onChange={handleBusinessInfoChange} placeholder="e.g., Acme Corp" required />
                                <TextareaField label="Business Description" id="description" name="description" value={businessInfo.description} onChange={handleBusinessInfoChange} placeholder="Describe what your business does." required rows={3} />
                                <InputField label="Website URL" id="website" name="website" value={businessInfo.website} onChange={handleBusinessInfoChange} placeholder="https://www.example.com" required />
                            </div>
                        </div>

                         <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                                <SparklesIcon className="w-6 h-6 text-primary" />
                                Auto-generate FAQs from your website
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Enter your website URL and let AI suggest questions and answers.</p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                <div className="w-full sm:flex-grow">
                                    <InputField 
                                        label="Your Website URL" 
                                        id="suggestion-url" 
                                        name="suggestion-url" 
                                        value={suggestionUrl} 
                                        onChange={(e) => setSuggestionUrl(e.target.value)} 
                                        placeholder="https://www.your-business.com" 
                                        disabled={isSuggesting}
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleGenerateSuggestions} 
                                    disabled={isSuggesting}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-wait"
                                >
                                    {isSuggesting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : 'Generate Suggestions'}
                                </button>
                            </div>
                            <div className="mt-4 text-sm text-center min-h-[20px]">
                                {isSuggesting && (
                                    <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 animate-fade-in">
                                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Analyzing your website... this may take a moment.</span>
                                    </div>
                                )}
                                {suggestionError && (
                                    <p className="text-red-600 dark:text-red-400 animate-fade-in font-medium">{suggestionError}</p>
                                )}
                            </div>
                            {suggestedFaqs.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Suggestions:</h3>
                                    {suggestedFaqs.map((faq, index) => (
                                        <div key={index} className="bg-slate-50 dark:bg-gray-700/50 p-4 border border-gray-200/80 dark:border-gray-700 rounded-xl flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{faq.question}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{faq.answer}</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => handleAddSuggestedFaq(faq)} 
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary dark:text-violet-300 bg-violet-100 dark:bg-violet-500/20 rounded-full hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors flex-shrink-0"
                                                aria-label={`Add suggestion: ${faq.question}`}
                                            >
                                                <PlusCircleIcon className="w-4 h-4" />
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Choose a personality</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">This will define the tone and style of your chatbot's responses.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {PERSONALITY_DETAILS.map(p => (
                                <div key={p.type} className="relative group flex flex-col">
                                    <button 
                                        type="button" 
                                        onClick={() => setPersonality(p.type)} 
                                        className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 flex-grow ${personality === p.type ? 'border-primary bg-violet-50 dark:bg-violet-900/50 shadow-lg scale-105' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:border-primary-light hover:shadow-md'}`}
                                        aria-describedby={`tooltip-${p.type.replace(/\s/g, '-')}`}
                                    >
                                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{p.type}</h3>
                                    </button>
                                    <div
                                        id={`tooltip-${p.type.replace(/\s/g, '-')}`}
                                        role="tooltip"
                                        className="absolute bottom-full mb-2 w-full left-1/2 -translate-x-1/2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                                    >
                                        <div className="bg-gray-800 text-white text-xs rounded-lg py-1.5 px-3 text-center shadow-lg whitespace-normal">
                                            {p.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide-up">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Add Frequently Asked Questions</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Provide answers to common questions your customers might have.</p>
                        <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                          {faqs.map((faq, index) => (
                              <div key={faq.id} className="bg-slate-50 dark:bg-gray-700/50 p-5 border border-gray-200/80 dark:border-gray-700 rounded-xl space-y-4 relative shadow-sm transition-all duration-300 hover:border-primary-light hover:shadow-md">
                                  <InputField 
                                    label={<span className="font-semibold text-gray-800 dark:text-gray-200">{`Question ${index + 1}`}</span>} 
                                    id={`q-${faq.id}`} name={`q-${faq.id}`} 
                                    value={faq.question} 
                                    onChange={e => handleFaqChange(faq.id, 'question', e.target.value)} 
                                    placeholder="e.g., What are your opening hours?" 
                                  />
                                  <TextareaField 
                                    label={<span className="font-semibold text-gray-800 dark:text-gray-200">Answer</span>} 
                                    id={`a-${faq.id}`} name={`a-${faq.id}`} 
                                    value={faq.answer} 
                                    onChange={e => handleFaqChange(faq.id, 'answer', e.target.value)} 
                                    placeholder="e.g., We are open from 9 AM to 5 PM, Monday to Friday." 
                                    rows={3}
                                  />
                                  {faqs.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => removeFaq(faq.id)} 
                                      className="absolute top-3 right-3 p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200" 
                                      aria-label={`Remove FAQ ${index + 1}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                  )}
                              </div>
                          ))}
                        </div>
                        <button type="button" onClick={addFaq} className="mt-6 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                          + Add another FAQ
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <button type="button" onClick={prevStep} disabled={step === 1} className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    Back
                </button>
                {step < 3 ? (
                    <button type="button" onClick={nextStep} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        Next
                    </button>
                ) : (
                    <button type="submit" disabled={isLoading} className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-wait">
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
                          <SparklesIcon className="w-5 h-5 mr-2" />
                          Generate Script
                        </>
                      )}
                    </button>
                )}
            </div>
        </form>
    </div>
  );
};