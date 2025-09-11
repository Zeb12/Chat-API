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
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export type ChatbotConfig = {
  businessInfo: BusinessInfo;
  personality: Personality;
  faqs: FAQ[];
}

export interface Plan {
  id: string; // This will correspond to your Stripe Price ID
  name: string;
  price: string;
  priceDetail: string;
  features: string[];
  cta: string;
  featured?: boolean;
  sort_order?: number;
}

export interface PlansResponse {
  plans: Plan[];
  isDynamic: boolean;
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
  plan: 'Free' | 'Basic' | 'Pro';
  joinedAt: string;
  status: 'Active' | 'Suspended'; // Platform access status
  role: 'User' | 'Admin';
  subscriptionStatus: string | null; // From Stripe: 'active', 'trialing', 'canceled', etc.
  renewalDate: string | null; // Formatted date string
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

export type AppState = 'landing' | 'dashboard' | 'wizard' | 'result' | 'auth' | 'terms' | 'privacy' | 'admin' | 'stripe-connect';