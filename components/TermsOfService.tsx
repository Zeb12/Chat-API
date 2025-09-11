import React from 'react';

interface LegalPageProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-surface dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in">
      <div className="prose dark:prose-invert max-w-none prose-h1:text-3xl prose-h1:font-bold prose-h1:text-gray-900 dark:prose-h1:text-white prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-ul:list-disc prose-ul:ml-6">
        <h1>Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 !mt-0">Last updated: July 26, 2024</p>
        
        <p>Welcome to ChatBot Pro! These Terms of Service ("Terms") govern your use of our website and the AI chatbot generation services (collectively, the "Service") provided by ChatBot Pro ("we," "us," or "our").</p>

        <h2>1. Agreement to Terms</h2>
        <p>By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Service.</p>

        <h2>2. The Service</h2>
        <p>ChatBot Pro provides a platform for users to generate custom AI-powered chatbot scripts. You are responsible for the configuration of your chatbot, including the business information, personality, and FAQs you provide. The generated script is intended to be embedded on your website.</p>

        <h2>3. User Accounts</h2>
        <p>To access certain features of the Service, you must create an account. You are responsible for safeguarding your account information and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
        
        <h2>4. Subscriptions and Payments</h2>
        <p>Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis. Subscriptions automatically renew unless canceled. All payments are handled by our third-party payment processor, Stripe. We do not store your credit card details.</p>

        <h2>5. User-Generated Content</h2>
        <p>You retain ownership of all the information and content you provide to configure your chatbot (e.g., business info, FAQs). By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, process, and transmit this content solely for the purpose of providing the Service to you.</p>

        <h2>6. Prohibited Activities</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
            <li>Create chatbots for illegal, harmful, or fraudulent purposes.</li>
            <li>Transmit any content that is unlawful, defamatory, or infringes on the rights of others.</li>
            <li>Attempt to reverse-engineer, decompile, or otherwise discover the source code of the Service or the generated scripts beyond the intended use.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
        </ul>

        <h2>7. Termination</h2>
        <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach the Terms.</p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding the operation or availability of the Service or the accuracy of the information, content, or materials included therein.</p>
        
        <h2>9. Limitation of Liability</h2>
        <p>In no event shall ChatBot Pro, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

        <h2>10. Governing Law</h2>
        <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is established, without regard to its conflict of law provisions.</p>
        
        <h2>11. Changes to Terms</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice before any new terms take effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>

        <h2>12. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at support@chatbotpro.example.com.</p>
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
