import { Personality, Plan } from './types';

export const PERSONALITY_DETAILS: { type: Personality; description:string }[] = [
  {
    type: Personality.Friendly,
    description: 'A conversational and approachable tone. Good for general customer service.',
  },
  {
    type: Personality.Professional,
    description: 'A more formal and direct tone. Best for corporate or B2B contexts.',
  },
  {
    type: Personality.Witty,
    description: 'Uses clever humor and light-hearted jokes. Engages users in a fun way.',
  },
  {
    type: Personality.Enthusiastic,
    description: 'An upbeat, positive, and energetic tone. Great for marketing and sales bots.',
  },
];

/*
IMPORTANT: The data below is used as a fallback if the 'plans' table
is not found in the database. For full functionality, including the ability
for admins to edit plans, you must create the 'plans' table in Supabase.
See setup instructions in 'services/geminiService.ts'.
*/
export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free', // A special identifier for the free plan
    name: 'Free',
    price: '$0',
    priceDetail: 'per month',
    features: [
      '1 Chatbot',
      'Up to 10 FAQs',
      'Basic Customization',
      '1,000 messages/month',
    ],
    cta: 'Get Started',
  },
  {
    id: 'REPLACE_WITH_YOUR_STRIPE_BASIC_PRICE_ID', // <-- REPLACE THIS with your Stripe Price ID
    name: 'Basic',
    price: '$10',
    priceDetail: 'per month',
    features: [
      '5 Chatbots',
      'Unlimited FAQs',
      'Advanced Customization',
      '10,000 messages/month',
      'Email Support',
    ],
    cta: 'Choose Basic',
  },
  {
    id: 'REPLACE_WITH_YOUR_STRIPE_PRO_PRICE_ID', // <-- REPLACE THIS with your Stripe Price ID
    name: 'Pro',
    price: '$29.99',
    priceDetail: 'per month',
    features: [
      'Unlimited Chatbots',
      'Unlimited FAQs',
      'Advanced Customization',
      '100,000 messages/month',
      'Priority Email Support',
      'Remove Branding',
    ],
    cta: 'Choose Pro',
    featured: true,
  },
];