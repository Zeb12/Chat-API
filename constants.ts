import { Personality, Plan } from './types';

export const PERSONALITY_DETAILS: { type: Personality; description: string }[] = [
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

export const PLANS: Plan[] = [
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
    maxChatbots: 1,
  },
  {
    // IMPORTANT: This is a Stripe PRODUCT ID. You must replace it with a PRICE ID.
    // HOW TO FIX:
    // 1. In your Stripe Dashboard, go to Products and click on your "Basic" plan.
    // 2. Under the "Pricing" section, copy the Price ID (it starts with 'price_...').
    // 3. Paste the Price ID below, replacing the 'prod_...' value.
    id: 'price_1S61NBPE0RhZFcxKnhMVwnqx', // <-- REPLACE THIS with your Stripe Price ID
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
    maxChatbots: 5,
  },
  {
    // IMPORTANT: This is a Stripe PRODUCT ID. You must replace it with a PRICE ID.
    // HOW TO FIX:
    // 1. In your Stripe Dashboard, go to Products and click on your "Pro" plan.
    // 2. Under the "Pricing" section, copy the Price ID (it starts with 'price_...').
    // 3. Paste the Price ID below, replacing the 'prod_...' value.
    id: 'price_1S61OUPE0RhZFcxKEPmQDlLE', // <-- REPLACE THIS with your Stripe Price ID
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
    maxChatbots: Infinity,
  },
];