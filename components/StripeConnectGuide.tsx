import React from 'react';
import { StripeIcon } from './icons/StripeIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { CogIcon } from './icons/CogIcon';

interface StripeConnectGuideProps {
  onBack: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode, language?: string }> = ({ children, language = 'bash' }) => (
    <pre className="bg-gray-900 text-gray-200 rounded-lg p-4 my-4 text-sm overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const StepCard: React.FC<{ step: number; title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ step, title, children, icon }) => (
    <div className="bg-slate-50 dark:bg-gray-700/50 p-6 border border-gray-200/80 dark:border-gray-700 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">{step}</div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">{icon} {title}</h2>
            </div>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-ul:list-disc prose-ul:ml-6 prose-code:bg-gray-200 dark:prose-code:bg-gray-600 prose-code:p-1 prose-code:rounded-md prose-code:font-mono">
            {children}
        </div>
    </div>
);

export const StripeConnectGuide: React.FC<StripeConnectGuideProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-surface dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in">
        <div className="text-center mb-10">
            <StripeIcon className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4">Stripe Integration Guide</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Follow these steps to enable payments and subscriptions.</p>
        </div>

        <div className="space-y-8">
            <StepCard step={1} title="Set Up Stripe Products" icon={<StripeIcon className="w-6 h-6" />}>
                <p>First, you need to create your subscription plans as products in your Stripe Dashboard.</p>
                <ul>
                    <li>Log in to your <a href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer">Stripe Dashboard</a>.</li>
                    <li>Go to the <strong>Products</strong> section and add a new product for your 'Basic' and 'Pro' plans.</li>
                    <li>For each product, add a recurring price. This will generate a <strong>Price ID</strong> (e.g., <code>price_1S59...</code>).</li>
                    <li><strong>Crucially, you need the Price ID, not the Product ID.</strong> You'll use these IDs in the next step.</li>
                </ul>
            </StepCard>

            <StepCard step={2} title="Update Your Code" icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}>
                <p>Open the <code>constants.ts</code> file in your project and replace the placeholder Price IDs with the ones you just created in Stripe.</p>
                <CodeBlock language="typescript">{`// file: constants.ts

export const PLANS: Plan[] = [
  // ... Free plan
  {
    // ...
    id: 'price_...', // <-- PASTE YOUR 'Basic' PRICE ID HERE
    name: 'Basic',
    // ...
  },
  {
    // ...
    id: 'price_...', // <-- PASTE YOUR 'Pro' PRICE ID HERE
    name: 'Pro',
    // ...
  },
];`}</CodeBlock>
            </StepCard>
            
            <StepCard step={3} title="Configure Supabase Secrets" icon={<CogIcon className="w-6 h-6" />}>
                <p>Your Supabase Edge Functions need secure API keys to communicate with Stripe. These should be stored as secrets in your Supabase project.</p>
                
                <h3 className="font-bold mt-4">A. Get Stripe Secret Key</h3>
                <ul>
                    <li>In your Stripe Dashboard, go to <strong>Developers &gt; API keys</strong>.</li>
                    <li>Copy your <strong>Secret key</strong>. It will start with <code>sk_live_...</code> or <code>sk_test_...</code> for test mode.</li>
                </ul>

                <h3 className="font-bold mt-4">B. Get Webhook Signing Secret</h3>
                <ul>
                    <li>Go to <strong>Developers &gt; Webhooks</strong> and click 'Add endpoint'.</li>
                    {/* FIX: Wrap the URL in a template literal to prevent JSX from interpreting `<` and `>` as tags. */}
                    <li>The endpoint URL should be: <code>{`https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/stripe-webhooks`}</code></li>
                    <li>Listen for the following events: <code>customer.subscription.created</code>, <code>customer.subscription.updated</code>, and <code>customer.subscription.deleted</code>.</li>
                    <li>After creating the endpoint, reveal and copy the <strong>Signing secret</strong> (it starts with <code>whsec_...</code>).</li>
                </ul>

                <h3 className="font-bold mt-4">C. Set Secrets in Supabase</h3>
                <ul>
                    <li>Go to your Supabase Project Dashboard, then <strong>Project Settings &gt; Secrets</strong>.</li>
                    <li>Add the following <strong>six</strong> secrets. You can find your Supabase keys and URL in your project's <strong>API Settings</strong>.</li>
                </ul>
                <CodeBlock>{`SITE_URL                        # Your final deployed website URL (e.g., https://myapp.com)
STRIPE_SECRET_KEY               # From Stripe Developers > API keys (Secret key)
STRIPE_WEBHOOK_SIGNING_SECRET   # From Stripe Developers > Webhooks (Signing secret)
SUPABASE_URL                    # From Supabase API Settings (Project URL)
SUPABASE_ANON_KEY               # From Supabase API Settings (Project API keys > anon public)
SUPABASE_SERVICE_ROLE_KEY       # From Supabase API Settings (Project API keys > service_role secret)`}</CodeBlock>
                <p className="!mt-2"><strong>Important:</strong> The <code>SUPABASE_SERVICE_ROLE_KEY</code> is required for the Stripe Webhook function to securely update user subscription data. The other keys are used by various parts of the application.</p>
            </StepCard>
            
            <StepCard step={4} title="Deploy Your Functions" icon={<TerminalIcon className="w-6 h-6" />}>
                <p>For your Supabase functions to access the new secrets, you need to deploy them. Run the following commands from your project's root directory in your terminal:</p>
                <CodeBlock>{`# Deploy the checkout function
supabase functions deploy create-checkout

# Deploy the webhooks function (must disable JWT verification)
supabase functions deploy stripe-webhooks --no-verify-jwt`}</CodeBlock>
                 <p className="!mt-4">After deploying, your Stripe integration should be fully configured and ready to test!</p>
            </StepCard>

        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-center">
            <button
                onClick={onBack}
                className="px-6 py-3 text-base font-semibold text-primary hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
            >
                &larr; Back to Admin Dashboard
            </button>
        </div>
    </div>
  );
};