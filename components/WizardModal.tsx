import React from 'react';
import { ChatbotWizard } from './ChatbotWizard';
import type { ChatbotConfig } from '../types';

interface WizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (config: ChatbotConfig) => void;
    isLoading: boolean;
}

export const WizardModal: React.FC<WizardModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div 
                className="max-h-[95vh] w-full max-w-4xl overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <ChatbotWizard 
                    onGenerate={onGenerate} 
                    isLoading={isLoading} 
                    onClose={onClose}
                />
            </div>
        </div>
    );
};
