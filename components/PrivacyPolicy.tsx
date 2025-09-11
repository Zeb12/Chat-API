import React from 'react';

interface LegalPageProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-surface dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in">
      <div className="prose dark:prose-invert max-w-none prose-h1:text-3xl prose-h1:font-bold prose-h1:text-gray-900 dark:prose-h1:text-white prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-ul:list-disc prose-ul:ml-6">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 !mt-0">Last updated: July 26, 2024</p>
        
        <p>This page is a placeholder for the Privacy Policy. In a real application, this section would detail how user data is collected, used, and protected according to legal requirements like GDPR and CCPA.</p>
        
        <h2>1. Information We Collect</h2>
        <p>We would typically collect information such as:</p>
        <ul>
            <li><strong>Account Information:</strong> Your full name, email address, and password when you register.</li>
            <li><strong>Configuration Data:</strong> The business details, personality settings, and FAQs you provide for your chatbots.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our Service, such as features used and session duration.</li>
            <li><strong>Payment Information:</strong> We do not store your payment details. They are securely handled by our payment processor, Stripe.</li>
        </ul>
        
        <h2>2. How We Use Your Information</h2>
        <p>Your information is used to provide and improve the Service, process payments, communicate with you about your account, and ensure the security of our platform.</p>
        
        <h2>3. Data Sharing</h2>
        <p>We do not sell your personal data. We may share it with trusted third-party services like Supabase (for backend infrastructure), Stripe (for payments), and Google Gemini (for AI processing), only as necessary to provide the Service.</p>
        
        <h2>4. Your Rights</h2>
        <p>You have the right to access, update, or delete your personal information. You can manage your account settings or contact us directly for assistance with your data.</p>

        <h2>5. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@chatbotpro.example.com.</p>
      </div>
      <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-start">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
};
