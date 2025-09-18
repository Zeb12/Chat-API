import React from 'react';
import type { UserRecord } from '../types';
import { XIcon } from './icons/XIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface UserDetailsModalProps {
    user: UserRecord;
    onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white break-words">{value || 'N/A'}</dd>
    </div>
);

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full m-4 transform transition-all animate-slide-up relative max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <UserCircleIcon className="w-10 h-10 text-primary flex-shrink-0" />
                        <div>
                            <h2 id="user-details-title" className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="mt-6 space-y-6 overflow-y-auto pr-2 flex-grow">
                    {/* Key Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailItem label="User ID" value={<code className="text-xs">{user.id}</code>} />
                        <DetailItem label="Role" value={user.role} />
                        <DetailItem label="Joined At" value={new Date(user.joinedAt).toLocaleString()} />
                        <DetailItem label="Last Sign In" value={user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : 'Never'} />
                    </div>

                    {/* Subscription Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Subscription</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                            <DetailItem label="Plan" value={user.plan} />
                            <DetailItem label="Status" value={<span className="capitalize">{user.subscriptionStatus?.replace('_', ' ') || 'N/A'}</span>} />
                            <DetailItem label="Renewal Date" value={user.renewalDate} />
                        </div>
                    </div>

                    {/* Raw Metadata Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Raw Metadata</h3>
                        <pre className="bg-slate-100 dark:bg-gray-900/50 p-4 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
                            {JSON.stringify(user.raw_user_meta_data, null, 2)}
                        </pre>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};