

export interface BusinessInfo {
  name: string;
  description: string;
  website: string;
}

export enum Personality {
  Friendly = 'Friendly & Helpful',
  Professional = 'Formal & Professional',
  Witty = 'Witty & Humorous',
  Enthusiastic = 'Enthusiastic & Energetic',
  HelpfulAssistant = 'Helpful Assistant',
  SarcasticBot = 'Sarcastic Bot',
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ChatbotAppearance {
  logo: string | null; // Base64 encoded image
  colors: {
    primary: string;
    botMessage: string;
    text: string;
  };
  fontFamily: string;
}

export type ChatbotConfig = {
  businessInfo: BusinessInfo;
  personality: Personality;
  faqs: FAQ[];
  appearance: ChatbotAppearance;
}

export interface Plan {
  id: string; // This will correspond to your Stripe Price ID
  name: string;
  price: string;
  priceDetail: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
  maxChatbots: number;
}

export interface DashboardStats {
  totalChatbots: number;
  totalConversations: number;
  responseRate: number;
}

export interface ChatbotRecord {
  id: string;
  name: string;
  createdAt: string;
  monthlyConversations: number;
  conversationTrend: number[];
  config: ChatbotConfig;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalChatbots: number;
  totalConversations: number;
  monthlyRevenue: number;
}

export interface UserRecord {
  id: string;
  email: string;
  plan: 'Starter' | 'Basic' | 'Pro' | 'None';
  joinedAt: string;
  lastSignInAt: string | null;
  status: 'Active' | 'Suspended'; // Platform access status
  role: 'User' | 'Admin';
  subscriptionStatus: string | null; // From Stripe: 'active', 'trialing', 'canceled', etc.
  renewalDate: string | null; // Formatted date string
  raw_user_meta_data?: Record<string, any>;
}

export interface UserGrowthDataPoint {
    date: string;
    count: number;
}

export interface PlanDistribution {
    free: number;
    basic: number;
    pro: number;
}

export interface ActivityEvent {
    id: string;
    type: 'user_signup' | 'chatbot_created' | 'subscription_started' | 'subscription_canceled';
    description: string;
    userEmail: string;
    timestamp: string;
}

export type AppState = 'landing' | 'dashboard' | 'result' | 'auth' | 'terms' | 'privacy' | 'admin' | 'payment-success';