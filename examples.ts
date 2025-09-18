import { Personality, ChatbotAppearance } from './types';

// Omit 'id' from FAQ for examples, as it will be generated dynamically.
type ExampleFAQ = Omit<import('./types').FAQ, 'id'>;

export interface ExampleConfig {
  name: string;
  description: string;
  config: {
    businessInfo: import('./types').BusinessInfo;
    personality: Personality;
    faqs: ExampleFAQ[];
    appearance: ChatbotAppearance;
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
      appearance: {
        logo: null,
        colors: {
          primary: '#4F46E5', // Indigo 600
          botMessage: '#F3F4F6', // Gray 100
          text: '#111827', // Gray 900
        },
        fontFamily: 'Poppins',
      },
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
      appearance: {
        logo: null,
        colors: {
          primary: '#059669', // Emerald 600
          botMessage: '#F0FDF4', // Emerald 50
          text: '#1F2937', // Gray 800
        },
        fontFamily: 'Roboto',
      },
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
      appearance: {
        logo: null,
        colors: {
          primary: '#D97706', // Amber 600
          botMessage: '#FFFBEB', // Amber 50
          text: '#374151', // Gray 700
        },
        fontFamily: 'Lato',
      },
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
  {
    name: 'Tech Support Bot',
    description: 'A helpful assistant for a tech product.',
    config: {
      businessInfo: {
        name: 'Nexus Systems',
        description: 'Nexus Systems provides cutting-edge software solutions for cloud infrastructure management and data analytics.',
        website: 'https://www.nexussystems.example.com',
      },
      personality: Personality.HelpfulAssistant,
      appearance: {
        logo: null,
        colors: {
          primary: '#0E7490', // Cyan 700
          botMessage: '#ECFEFF', // Cyan 50
          text: '#1F2937', // Gray 800
        },
        fontFamily: 'Nunito',
      },
      faqs: [
        {
          question: 'How do I reset my password?',
          answer: 'You can reset your password by navigating to the login page and clicking the "Forgot Password" link. An email with instructions will be sent to your registered address.',
        },
        {
          question: 'What are the system requirements for your software?',
          answer: 'Our software runs on Windows 10/11, macOS 11 (Big Sur) or later, and most major Linux distributions. A minimum of 8GB of RAM is recommended for optimal performance.',
        },
        {
            question: 'How can I contact technical support?',
            answer: 'For technical support, please submit a ticket through our online portal at support.nexussystems.example.com or call our support line at 1-800-555-0123 during business hours (9 AM - 6 PM EST, Mon-Fri).'
        }
      ],
    },
  },
  {
    name: 'Real Estate Agent',
    description: 'A professional bot for a real estate agency.',
    config: {
      businessInfo: {
        name: 'Prestige Properties',
        description: 'A full-service real estate agency dedicated to helping clients buy, sell, and rent properties. Our experienced agents provide unparalleled market knowledge and negotiation skills.',
        website: 'https://www.prestigeproperties.example.com',
      },
      personality: Personality.Professional,
      appearance: {
        logo: null,
        colors: {
          primary: '#2563EB', // Blue 600
          botMessage: '#F3F4F6', // Gray 100
          text: '#1F2937', // Gray 800
        },
        fontFamily: 'Montserrat',
      },
      faqs: [
        {
          question: 'How can I view a property?',
          answer: 'You can schedule a viewing by contacting the listing agent directly through our website or by calling our office. We offer both in-person and virtual tours.',
        },
        {
          question: 'What are your commission rates for selling a home?',
          answer: 'Our commission rates are competitive and vary depending on the property and market conditions. Please contact us for a free consultation and a detailed breakdown of costs.',
        },
        {
            question: 'Do you help with rentals?',
            answer: 'Yes, we have a dedicated team that assists clients with finding and securing rental properties in the area.'
        }
      ],
    },
  },
  {
    name: 'Fitness Coach',
    description: 'An energetic bot for a personal trainer.',
    config: {
      businessInfo: {
        name: 'FitLife Coaching',
        description: 'Personalized fitness and nutrition coaching to help you achieve your health goals. We offer one-on-one sessions, group classes, and online programs.',
        website: 'https://www.fitlifecoaching.example.com',
      },
      personality: Personality.Enthusiastic,
      appearance: {
        logo: null,
        colors: {
          primary: '#F97316', // Orange 500
          botMessage: '#FFF7ED', // Orange 50
          text: '#374151', // Gray 700
        },
        fontFamily: 'Poppins',
      },
      faqs: [
        {
          question: 'What types of training do you offer?',
          answer: "We offer a variety of training styles, including strength training, HIIT, yoga, and endurance coaching. Let's find the perfect fit for you!",
        },
        {
          question: 'How much does a session cost?',
          answer: 'Our prices are awesome! A single session is $75, but we have amazing packages that bring the cost down. Check out our pricing page for all the details!',
        },
        {
          question: 'Do I need to be in shape to start?',
          answer: 'Not at all! We welcome everyone, from total beginners to seasoned athletes. Every journey starts with a single step, and we are so excited to take it with you!',
        },
      ],
    },
  },
  {
    name: 'Marketing Agency',
    description: 'A witty bot for a digital marketing agency.',
    config: {
      businessInfo: {
        name: 'Growth Spark Digital',
        description: "We're a digital marketing agency that doesn't believe in boring. We use a mix of SEO, PPC, and killer content strategy to make your brand unforgettable.",
        website: 'https://www.growthspark.example.com',
      },
      personality: Personality.Witty,
      appearance: {
        logo: null,
        colors: {
          primary: '#9333EA', // Purple 600
          botMessage: '#FAF5FF', // Purple 50
          text: '#1F2937', // Gray 800
        },
        fontFamily: 'Inter',
      },
      faqs: [
        {
          question: 'What services do you offer?',
          answer: 'We do all the digital things: SEO, so Google loves you; PPC, so you can pay for friends; and social media, so you look popular. What sounds good?',
        },
        {
          question: 'How much do you charge?',
          answer: "Less than a Super Bowl ad, more than a cup of coffee. Our pricing is custom-tailored. Let's chat and we'll figure out a plan that fits your budget.",
        },
        {
            question: 'Can you guarantee results?',
            answer: 'I can guarantee we will work our tails off. Anyone who guarantees number one on Google is selling snake oil. We sell results, not miracles.'
        }
      ],
    },
  },
  {
    name: 'Non-Profit',
    description: 'A friendly bot for a charitable organization.',
    config: {
      businessInfo: {
        name: 'Community Hearts',
        description: 'A non-profit organization dedicated to providing food, shelter, and support to families in need within our local community.',
        website: 'https://www.communityhearts.example.com',
      },
      personality: Personality.Friendly,
      appearance: {
        logo: null,
        colors: {
          primary: '#16A34A', // Green 600
          botMessage: '#F0FDF4', // Green 50
          text: '#1F2937', // Gray 800
        },
        fontFamily: 'Nunito',
      },
      faqs: [
        {
          question: 'How can I donate?',
          answer: 'Thank you for your generosity! You can make a secure online donation through our website. Every little bit helps make a big difference in our community.',
        },
        {
          question: 'Are there volunteer opportunities?',
          answer: 'Yes, we are always looking for volunteers! Please visit our volunteer page to see current openings and fill out an application. We would love to have you join us!',
        },
        {
            question: 'How are donations used?',
            answer: 'We are proud to say that 90 cents of every dollar donated goes directly to our programs, providing meals, temporary housing, and educational resources for local families.'
        }
      ],
    },
  },
];