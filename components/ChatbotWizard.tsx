import React, { useState } from 'react';
// FIX: Import `Personality` as a value because it is an enum used in component logic. Other imports remain as types.
import { Personality } from '../types';
import type { BusinessInfo, FAQ, ChatbotConfig, ChatbotAppearance } from '../types';
import { PERSONALITY_DETAILS, FONT_OPTIONS } from '../constants';
import { EXAMPLES, ExampleConfig } from '../examples';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { StepIndicator } from './StepIndicator';
import { suggestFaqsFromUrl } from '../services/geminiService';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { XIcon } from './icons/XIcon';
import { FaceSmileIcon } from './icons/FaceSmileIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
// FIX: Corrected import name from InformationCircleIcon to InfoCircleIcon to match the export.
import { InfoCircleIcon } from './icons/InfoCircleIcon';
import { FaceLaughingIcon } from './icons/FaceLaughingIcon';
import { FaceWithRollingEyesIcon } from './icons/FaceWithRollingEyesIcon';

type SuggestedFAQ = Omit<FAQ, 'id'>;

interface ChatbotWizardProps {
  onGenerate: (config: ChatbotConfig) => void;
  isLoading: boolean;
  onClose?: () => void;
}

const InputField: React.FC<{ label: React.ReactNode; id: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean; disabled?: boolean; maxLength?: number; }> = ({ label, id, name, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input id={id} name={name} type="text" {...props} className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm transition dark:text-white disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-gray-700" />
    </div>
);

const TextareaField: React.FC<{ label: React.ReactNode; id: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; required?: boolean; rows?: number; maxLength?: number; }> = ({ label, id, name, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <textarea id={id} name={name} {...props} className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm transition dark:text-white" />
    </div>
);

export const ChatbotWizard: React.FC<ChatbotWizardProps> = ({ onGenerate, isLoading, onClose }) => {
  const [step, setStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({ name: '', description: '', website: '' });
  const [personality, setPersonality] = useState<Personality>(PERSONALITY_DETAILS[0].type);
  const [appearance, setAppearance] = useState<ChatbotAppearance>({
    logo: null,
    colors: {
      primary: '#7C3AED',
      botMessage: '#F3F4F6',
      text: '#1F2937'
    },
    fontFamily: 'Inter',
  });
  const [faqs, setFaqs] = useState<FAQ[]>([{ id: crypto.randomUUID(), question: '', answer: '' }]);
  
  // State for FAQ suggestions
  const [suggestionUrl, setSuggestionUrl] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [suggestedFaqs, setSuggestedFaqs] = useState<SuggestedFAQ[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const MAX_FAQS = 25;

  const personalityIcons: Record<Personality, React.ReactNode> = {
    [Personality.Friendly]: <FaceSmileIcon className="w-8 h-8" />,
    [Personality.Professional]: <BriefcaseIcon className="w-8 h-8" />,
    [Personality.Witty]: <FaceLaughingIcon className="w-8 h-8" />,
    [Personality.Enthusiastic]: <RocketLaunchIcon className="w-8 h-8" />,
    [Personality.HelpfulAssistant]: <InfoCircleIcon className="w-8 h-8" />,
    [Personality.SarcasticBot]: <FaceWithRollingEyesIcon className="w-8 h-8" />,
  };

  const handleBusinessInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBusinessInfo({ ...businessInfo, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
        setErrors(prev => ({...prev, [e.target.name]: ''}));
    }
  };

  const handleAppearanceChange = <K extends keyof ChatbotAppearance>(key: K, value: ChatbotAppearance[K]) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
  };

  const handleColorChange = (colorName: keyof ChatbotAppearance['colors'], value: string) => {
    setAppearance(prev => ({
        ...prev,
        colors: { ...prev.colors, [colorName]: value }
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File is too large. Please select an image smaller than 5MB.");
        return;
    }

    const MAX_DIMENSION = 128;
    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > MAX_DIMENSION) {
                    height = Math.round((height * MAX_DIMENSION) / width);
                    width = MAX_DIMENSION;
                }
            } else {
                if (height > MAX_DIMENSION) {
                    width = Math.round((width * MAX_DIMENSION) / height);
                    height = MAX_DIMENSION;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const outputMimeType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
                const resizedDataUrl = canvas.toDataURL(outputMimeType, 0.9);
                handleAppearanceChange('logo', resizedDataUrl);
            } else {
                handleAppearanceChange('logo', event.target?.result as string);
            }
        };

        img.onerror = () => {
            alert("The selected file could not be read. Please choose a valid image file.");
        };
    };

    reader.onerror = () => {
        alert("There was an error reading the file.");
    };

    reader.readAsDataURL(file);
  };

  const handleFaqChange = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
  };
  
  const addFaq = () => {
    if (faqs.length >= MAX_FAQS) return;
    setFaqs([...faqs, { id: crypto.randomUUID(), question: '', answer: '' }]);
  };

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  const handleSelectExample = (example: ExampleConfig) => {
    setBusinessInfo(example.config.businessInfo);
    setPersonality(example.config.personality);
    setAppearance(example.config.appearance);
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
    setStep(4); // Navigate to the FAQ step to see the new addition
  };
  
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
        if (!businessInfo.name) newErrors.name = "Business name is required.";
        if (!businessInfo.description) newErrors.description = "Business description is required.";
        if (!businessInfo.website) {
            newErrors.website = "Website URL is required.";
        } else if (!validateUrl(businessInfo.website)) {
            newErrors.website = "Please enter a valid URL (e.g., https://example.com).";
        }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 4));
    }
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ businessInfo, personality, faqs, appearance });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in relative">
        {onClose && (
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Close"
            >
                <XIcon className="w-6 h-6" />
            </button>
        )}
        <div className="mb-12">
            <StepIndicator currentStep={step} totalSteps={4} stepNames={['Business Info', 'Personality', 'Appearance', 'FAQs']} />
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
                                <div>
                                    <InputField label="Business Name" id="name" name="name" value={businessInfo.name} onChange={handleBusinessInfoChange} placeholder="e.g., Acme Corp" required />
                                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <TextareaField label="Business Description" id="description" name="description" value={businessInfo.description} onChange={handleBusinessInfoChange} placeholder="Describe what your business does." required rows={3} maxLength={2000} />
                                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                                </div>
                                <div>
                                    <InputField label="Website URL" id="website" name="website" value={businessInfo.website} onChange={handleBusinessInfoChange} placeholder="https://www.example.com" required />
                                    {errors.website && <p className="text-red-600 text-sm mt-1">{errors.website}</p>}
                                </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                           {PERSONALITY_DETAILS.map(p => (
                                <button 
                                    key={p.type}
                                    type="button" 
                                    onClick={() => setPersonality(p.type)} 
                                    className={`relative w-full p-5 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-3 h-40 ${
                                        personality === p.type 
                                        ? 'border-primary bg-violet-50 dark:bg-violet-900/50 shadow-lg ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800' 
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:border-primary-light hover:shadow-md'
                                    }`}
                                >
                                    <div className="text-primary">
                                        {personalityIcons[p.type]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{p.type}</h3>
                                    </div>
                                    {personality === p.type && (
                                        <div className="absolute top-3 right-3 text-primary bg-white dark:bg-violet-900/50 rounded-full">
                                            <CheckCircleIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide-up space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Customize Appearance</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Match the chatbot's look and feel to your brand.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chatbot Logo/Avatar</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-500 overflow-hidden">
                                        {appearance.logo ? (
                                            <img src={appearance.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Preview</span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 text-sm font-semibold text-primary dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/80 transition-colors">
                                            Upload Image
                                        </label>
                                        <input id="logo-upload" type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} />
                                        {appearance.logo && (
                                            <button type="button" onClick={() => handleAppearanceChange('logo', null)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400">
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Font Family */}
                            <div>
                                <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Family</label>
                                <select 
                                    id="font-family" 
                                    value={appearance.fontFamily} 
                                    onChange={(e) => handleAppearanceChange('fontFamily', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm transition dark:text-white"
                                >
                                    {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Color Pickers */}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Palette</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <input type="color" id="primary-color" value={appearance.colors.primary} onChange={(e) => handleColorChange('primary', e.target.value)} className="w-10 h-10 p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer" />
                                    <label htmlFor="primary-color" className="text-sm text-gray-600 dark:text-gray-300">Primary Color</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="color" id="bot-message-color" value={appearance.colors.botMessage} onChange={(e) => handleColorChange('botMessage', e.target.value)} className="w-10 h-10 p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer" />
                                    <label htmlFor="bot-message-color" className="text-sm text-gray-600 dark:text-gray-300">Bot Message</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="color" id="text-color" value={appearance.colors.text} onChange={(e) => handleColorChange('text', e.target.value)} className="w-10 h-10 p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer" />
                                    <label htmlFor="text-color" className="text-sm text-gray-600 dark:text-gray-300">Text Color</label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
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
                                    maxLength={250}
                                  />
                                  <TextareaField 
                                    label={<span className="font-semibold text-gray-800 dark:text-gray-200">Answer</span>} 
                                    id={`a-${faq.id}`} name={`a-${faq.id}`} 
                                    value={faq.answer} 
                                    onChange={e => handleFaqChange(faq.id, 'answer', e.target.value)} 
                                    placeholder="e.g., We are open from 9 AM to 5 PM, Monday to Friday." 
                                    rows={3}
                                    maxLength={1500}
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
                        <button 
                            type="button" 
                            onClick={addFaq} 
                            disabled={faqs.length >= MAX_FAQS}
                            className="mt-6 text-sm font-medium text-primary hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + Add another FAQ
                        </button>
                        {faqs.length >= MAX_FAQS && (
                            <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                                You've reached the maximum number of FAQs to ensure reliable script generation.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <button type="button" onClick={prevStep} disabled={step === 1} className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    Back
                </button>
                {step < 4 ? (
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