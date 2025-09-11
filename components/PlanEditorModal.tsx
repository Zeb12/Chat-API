import React, { useState, useEffect } from 'react';
import type { Plan } from '../types';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';

interface PlanEditorModalProps {
  plan: Plan;
  onSave: (updatedPlan: Plan) => Promise<void>;
  onClose: () => void;
}

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; }> = ({ label, id, value, onChange, disabled }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input id={id} type="text" value={value} onChange={onChange} disabled={disabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:text-white disabled:opacity-50" />
    </div>
);

export const PlanEditorModal: React.FC<PlanEditorModalProps> = ({ plan, onSave, onClose }) => {
  const [editedPlan, setEditedPlan] = useState<Plan>({ ...plan });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure features is always an array
    if (!Array.isArray(editedPlan.features)) {
        setEditedPlan(p => ({ ...p, features: [] }));
    }
  }, [editedPlan.features]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditedPlan(prev => ({ ...prev, [id]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...editedPlan.features];
    newFeatures[index] = value;
    setEditedPlan(prev => ({ ...prev, features: newFeatures }));
  };
  
  const addFeature = () => {
    setEditedPlan(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    setEditedPlan(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const handleToggleFeatured = () => {
    setEditedPlan(prev => ({...prev, featured: !prev.featured }));
  }

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSave(editedPlan);
    } catch (err: any) {
      setError(err.message || "Failed to save plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFreePlan = editedPlan.id === 'free';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full m-4 transform transition-all animate-slide-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Plan: <span className="text-primary">{plan.name}</span></h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Changes will be reflected on the public pricing page immediately.</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6" /></button>
            </div>
            
            {error && <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>}

            <div className="mt-6 space-y-4 overflow-y-auto pr-2 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Plan Name" id="name" value={editedPlan.name} onChange={handleInputChange} />
                    <InputField label="Price ID" id="id" value={editedPlan.id} onChange={() => {}} disabled />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Price (e.g., $29.99)" id="price" value={editedPlan.price} onChange={handleInputChange} disabled={isFreePlan} />
                    <InputField label="Price Detail (e.g., per month)" id="priceDetail" value={editedPlan.priceDetail} onChange={handleInputChange} />
                </div>
                 <InputField label="CTA Button Text (e.g., Choose Pro)" id="cta" value={editedPlan.cta} onChange={handleInputChange} />
                
                <div>
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</h4>
                    <div className="space-y-2">
                        {editedPlan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:text-white"
                                    placeholder={`Feature ${index + 1}`}
                                />
                                <button onClick={() => removeFeature(index)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors" aria-label={`Remove feature ${index + 1}`}>
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addFeature} className="mt-2 text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
                        <PlusIcon className="w-4 h-4" /> Add Feature
                    </button>
                </div>
                
                <div className="relative flex items-start pt-4">
                    <div className="flex h-6 items-center">
                        <input id="featured" type="checkbox" checked={!!editedPlan.featured} onChange={handleToggleFeatured} disabled={isFreePlan} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50" />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="featured" className="font-medium text-gray-900 dark:text-gray-100">Featured Plan</label>
                        <p className="text-gray-500 dark:text-gray-400">Make this plan stand out on the pricing page.</p>
                    </div>
                </div>

            </div>

            <div className="mt-8 flex justify-end gap-x-4 flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={handleSave} disabled={isLoading} className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-wait">
                    {isLoading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Saving...
                        </>
                    ) : 'Save Changes'}
                </button>
            </div>
        </div>
    </div>
  );
};