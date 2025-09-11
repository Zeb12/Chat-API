import { Personality } from './types';

// Omit 'id' from FAQ for examples, as it will be generated dynamically.
type ExampleFAQ = Omit<import('./types').FAQ, 'id'>;

export interface ExampleConfig {
  name: string;
  description: string;
  config: {
    businessInfo: import('./types').BusinessInfo;
    personality: Personality;
    faqs: ExampleFAQ[];
  };
}

export const EXAMPLES: ExampleConfig[] = [
  {
    name: 'E-commerce Store',
    description: 'A friendly bot for an online clothing shop.',
    config: {
      businessInfo: {
        name: 'FashionForward',
        description: 'An online store selling trendy and sustainable apparel for all ages. We focus on high-quality materials and ethical production.',
        website: 'https://www.fashionforward.example.com',
      },
      personality: Personality.Friendly,
      faqs: [
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for all unworn items with tags attached. Please visit our returns page for more details.',
        },
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 5-7 business days. We also offer expedited 2-day shipping for an additional fee.',
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide! Shipping costs and times will vary depending on the destination.',
        },
      ],
    },
  },
  {
    name: 'SaaS Startup',
    description: 'A professional bot for a software company.',
    config: {
      businessInfo: {
        name: 'InnovateHub',
        description: 'A project management software designed to help teams collaborate, track progress, and deliver projects on time. We offer features like task management, Gantt charts, and team analytics.',
        website: 'https://www.innovatehub.example.com',
      },
      personality: Personality.Professional,
      faqs: [
        {
          question: 'What are your pricing plans?',
          answer: 'We have a few plans! The Basic plan is $10/user/month, the Pro plan is $20/user/month, and we have custom pricing for Enterprise teams. You can see a full feature comparison on our pricing page.',
        },
        {
          question: 'Do you offer a free trial?',
          answer: 'Yes, we offer a 14-day free trial on our Pro plan, no credit card required. You can sign up to get started instantly.',
        },
        {
            question: 'Is my data secure?',
            answer: 'Absolutely. We use industry-standard encryption for data at rest and in transit. Your security is our top priority.'
        }
      ],
    },
  },
  {
    name: 'Local Restaurant',
    description: 'An enthusiastic bot for a local eatery.',
    config: {
      businessInfo: {
        name: 'The Golden Ladle',
        description: 'A family-owned restaurant serving delicious, home-cooked meals made from locally-sourced ingredients. We are famous for our soups and sandwiches.',
        website: 'https://www.thegoldenladle.example.com',
      },
      personality: Personality.Enthusiastic,
      faqs: [
        {
          question: 'What are your hours?',
          answer: 'We are open from 11 AM to 9 PM, Tuesday through Sunday. We are closed on Mondays.',
        },
        {
          question: 'Do you take reservations?',
          answer: 'We do! You can make a reservation through our website or by giving us a call. We recommend booking in advance for weekend evenings.',
        },
        {
          question: 'Do you offer delivery?',
          answer: 'Yes! We partner with local delivery services. You can place an order for delivery directly from our website.',
        },
      ],
    },
  },
];
