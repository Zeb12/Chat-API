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
  {
    type: Personality.HelpfulAssistant,
    description: 'Clear, direct, and eager to assist. Perfect for support and guidance.',
  },
  {
    type: Personality.SarcasticBot,
    description: 'Dry, witty, and a little bit cynical. For when you want to keep users on their toes.',
  },
];

export const FONT_OPTIONS: string[] = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Nunito',
];

export const NO_PLAN: Plan = {
  id: 'none',
  name: 'No Plan',
  price: '-',
  priceDetail: '',
  description: 'You are not currently subscribed to any plan.',
  features: [],
  cta: 'Choose a Plan',
  maxChatbots: 0,
};

export const PLANS: Plan[] = [
  {
    // IMPORTANT: This is a Stripe Price ID. You must replace it.
    // HOW TO FIX:
    // 1. In Stripe, create a product for your "Starter" plan.
    // 2. Add a $5/month recurring price.
    // 3. Under "Additional options" for the price, set a 7-week trial period.
    // 4. Copy the Price ID (e.g., 'price_...').
    // 5. Paste it below, replacing the placeholder.
    id: 'price_1S7jWLPE0RhZFcxKGK7Jvd8S', // <-- REPLACE THIS
    name: 'Starter',
    price: '$5',
    priceDetail: 'per month',
    description: 'Perfect for getting started. Includes a 7-week free trial.',
    features: [
      '7-week free trial',
      '1 Chatbot',
      'Up to 10 FAQs',
      'Basic Customization',
      '1,000 messages/month',
    ],
    cta: 'Start 7-week Trial',
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
    description: 'Ideal for small businesses looking to engage more customers.',
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
    description: 'The ultimate solution for businesses that need unlimited power.',
    features: [
      'Unlimited Chatbots',
      'Unlimited FAQs',
      'Advanced Customization',
      '100,000 messages/month',
      'Priority Email Support',
      'Remove Branding',
      'Chat API Access',
    ],
    cta: 'Choose Pro',
    featured: true,
    maxChatbots: Infinity,
  },
];