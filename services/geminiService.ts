
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ChatbotConfig, DashboardStats, ChatbotRecord, FAQ, AdminDashboardStats, UserRecord, UserGrowthDataPoint, PlanDistribution, Plan, PlansResponse } from '../types';
import { DEFAULT_PLANS } from '../constants';

// --- IMPORTANT: CONFIGURE YOUR SUPABASE CREDENTIALS ---
// You can find these in your Supabase project dashboard under:
// Project Settings > API
//
// 1. supabaseUrl: Your project's URL.
// 2. supabaseAnonKey: Your project's "anon" public key.
//
// NOTE: Do NOT use the "service_role" key here, as it's not secure for the browser.
// Also, do NOT use the "publishable" key; you need the "anon" key for authentication.
// FIX: Add explicit 'string' types to widen the types from literals, resolving the comparison errors below.
const supabaseUrl: string = 'https://iezxuhaxapklxuxybgci.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllenh1aGF4YXBrbHh1eHliZ2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTEzNDAsImV4cCI6MjA3MjkyNzM0MH0.iTPlc2IcZR1Fz_Og3czXRw4ngtW1PgjY1e9ldLPixxo';

// This check determines if the user has configured their Supabase credentials.
// The app will show a configuration screen until these values are replaced.
export const isSupabaseConfigured =
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// FIX: Conditionally initialize the Supabase client to prevent a startup crash.
// The client was previously being created with placeholder values, causing an "Invalid URL"
// error that resulted in a white screen. Now, it's only created if the credentials are valid.
let supabaseSingleton: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabaseSingleton = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Explicitly enable session persistence. This ensures that the user's
      // session is stored in localStorage and they remain logged in between visits.
      persistSession: true,
      // Automatically refresh the auth token. This prevents the user from being
      // logged out due to an expired token.
      autoRefreshToken: true,
      // Detects the session from the URL, which is necessary for OAuth and magic links.
      detectSessionInUrl: true,
    },
  });
}

export const supabase: SupabaseClient | null = supabaseSingleton;

// --- INSTRUCTIONS FOR DATABASE SETUP ---
/**
 * To enable real-time data, you need to set up two things in your Supabase project:
 *
 * 1. A 'chatbots' table:
 *    Go to the SQL Editor in your Supabase dashboard and run this script:
 *
 *    CREATE TABLE public.chatbots (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 *      name TEXT NOT NULL,
 *      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
 *      config JSONB,
 *      conversations_count INT DEFAULT 0 NOT NULL
 *    );
 *
 *    -- Enable Row Level Security (RLS)
 *    ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
 *
 *    -- Create policies to allow users to manage their own chatbots
 *    CREATE POLICY "Users can manage their own chatbots" ON public.chatbots
 *      FOR ALL USING (auth.uid() = user_id);
 *
 *
 * 2. An 'all_users' view for the Admin Dashboard:
 *    This allows the admin user to see user data securely. Run this in the SQL Editor:
 *
 *    -- This view allows querying the normally protected 'auth.users' table.
 *    -- By using 'with (security_definer)', the view runs with the permissions of its owner (postgres),
 *    -- which has access to the auth schema. The RLS policy on the view then securely controls
 *    -- which data the calling user is allowed to see. This fixes permission errors.
 *    CREATE OR REPLACE VIEW public.all_users
 *    WITH (security_definer)
 *    AS SELECT
 *      id,
 *      email,
 *      raw_user_meta_data,
 *      created_at
 *    FROM
 *      auth.users;
 *
 *    -- Enable RLS for the new view
 *    ALTER VIEW public.all_users OWNER TO postgres;
 *    ALTER VIEW public.all_users ENABLE ROW LEVEL SECURITY;
 *
 *    -- Create a policy that only allows your designated admin email to read from this view.
 *    -- IMPORTANT: Replace 'zebsnellenbarger60@gmail.com' with your actual admin email address.
 *    CREATE POLICY "Allow admin to read all users" ON public.all_users
 *      FOR SELECT USING (
 *        auth.jwt()->>'email' = 'zebsnellenbarger60@gmail.com'
 *      );
 *
 * 3. A 'plans' table for dynamic pricing:
 *    This allows admins to manage pricing plans from the dashboard. Run this in the SQL editor:
 *    
 *    CREATE TABLE public.plans (
 *      id TEXT PRIMARY KEY,
 *      name TEXT NOT NULL,
 *      price TEXT NOT NULL,
 *      price_detail TEXT NOT NULL,
 *      features JSONB DEFAULT '[]'::jsonb,
 *      cta TEXT NOT NULL,
 *      featured BOOLEAN DEFAULT false,
 *      sort_order INT
 *    );
 *
 *    -- Enable Row Level Security (RLS)
 *    ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
 *
 *    -- Policy: Allow public read access for all users
 *    CREATE POLICY "Allow public read access to plans" ON public.plans
 *      FOR SELECT USING (true);
 *
 *    -- Policy: Allow users with an 'Admin' role in their metadata to manage plans
 *    -- This is more secure and flexible than hardcoding an email address.
 *    CREATE POLICY "Allow admins to manage plans" ON public.plans
 *      FOR ALL USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin' )
 *      WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin' );
 *
 *    -- After creating the table, go to the Table Editor, select the 'plans' table,
 *    -- and click 'Insert row' to add your pricing plans. You can use the data from
 *    -- 'constants.ts' as a starting point.
 */

export const generateChatbotScript = async (config: ChatbotConfig): Promise<string> => {
  // A guard clause ensures Supabase is configured before invoking a function.
  if (!supabase) throw new Error("Supabase is not configured. Cannot generate script.");
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-chatbot-script', {
      body: { config },
    });

    if (error) {
      throw error;
    }

    if (data && typeof data.script === 'string') {
      return data.script;
    } else {
      throw new Error("Invalid response format from the server.");
    }

  } catch (error) {
    console.error("Error invoking Supabase function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to generate chatbot script: ${errorMessage}`);
  }
};

/**
 * Invokes a Supabase Edge Function to generate FAQ suggestions from a website URL.
 * @param url The URL of the website to analyze.
 * @returns A promise that resolves to an array of suggested FAQs.
 */
export const suggestFaqsFromUrl = async (url: string): Promise<Omit<FAQ, 'id'>[]> => {
  if (!supabase) throw new Error("Supabase is not configured. Cannot suggest FAQs.");

  try {
    const { data, error } = await supabase.functions.invoke('suggest-faqs', {
      body: { url },
    });

    if (error) {
      // Handle function-specific errors that might be returned in the data payload
      if (data && data.error) {
        throw new Error(data.error);
      }
      throw error;
    }
    
    if (data && Array.isArray(data.faqs)) {
      return data.faqs;
    } else {
      throw new Error("Invalid response format from the FAQ suggestion service.");
    }
  } catch (error) {
    console.error("Error invoking suggest-faqs function:", error);
    // Re-throw the error directly to preserve the specific message from the backend function.
    // This provides clearer, more actionable feedback to the user (e.g., "Failed to fetch URL" vs. a generic wrapper message).
    if (error instanceof Error) {
        throw error;
    }
    // Fallback for non-Error objects
    throw new Error("An unknown error occurred while generating suggestions.");
  }
};


/**
 * Invokes a Supabase Edge Function to create a Stripe Checkout session.
 * This function securely handles the creation of a checkout session on the server-side
 * and returns the URL for redirection.
 *
 * @param {string} priceId The ID of the Stripe Price object.
 * @throws Will throw an error if the checkout session cannot be created or if the server response is invalid.
 */
export const redirectToCheckout = async (priceId: string) => {
  // A guard clause ensures Supabase is configured before invoking a function.
  if (!supabase) throw new Error("Supabase is not configured. Cannot redirect to checkout.");
  
  try {
    const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId },
    });

    if (invokeError) {
        // This is a special case. The "Failed to send a request" error is a generic
        // network error from the Supabase client, often caused by a CORS preflight failure.
        // This usually means the Edge Function crashed on startup (e.g., due to missing env vars)
        // and couldn't respond to the OPTIONS request. We provide a more helpful message here.
        if (invokeError.message.includes('Failed to send a request')) {
            throw new Error(
                "Could not connect to the payment service. This is often caused by a server-side configuration issue.\n\n" +
                "Troubleshooting steps:\n" +
                "1. Check the Supabase Function logs for 'create-checkout-session' for any startup errors.\n" +
                "2. Ensure all required environment variables (like STRIPE_SECRET_KEY, SITE_URL, etc.) are correctly set in your Supabase project."
            );
        }
        throw invokeError;
    }
    
    // Check for a specific error message from the backend function, otherwise check for URL
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.url) {
      // Redirect the user to the Stripe Checkout page
      window.location.href = data.url;
    } else {
      throw new Error("No checkout URL returned from the server. This could be due to an invalid Price ID or server configuration issue.");
    }
  } catch (error) {
    console.error("Error during checkout process:", error);
    // Re-throw the error so the calling component can handle it.
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(errorMessage);
  }
};

// --- New function to save chatbot config ---
export const createChatbot = async (config: ChatbotConfig): Promise<string> => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('chatbots')
    .insert({
      user_id: user.id,
      name: config.businessInfo.name || 'Untitled Chatbot',
      config: config,
    })
    .select('id')
    .single();

  if (error) {
    console.error("Error creating chatbot:", error);
    throw new Error(`Failed to save chatbot: ${error.message}`);
  }
  return data.id;
};

// --- Dashboard Data Functions ---

export const getDashboardStats = async (): Promise<DashboardStats> => {
  if (!supabase) throw new Error("Supabase not initialized");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { count: totalChatbots, error: chatbotsError } = await supabase
    .from('chatbots')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (chatbotsError) throw chatbotsError;

  const { data: conversationsData, error: convosError } = await supabase
    .from('chatbots')
    .select('conversations_count')
    .eq('user_id', user.id);

  if (convosError) throw convosError;

  const totalConversations = conversationsData.reduce((sum, bot) => sum + (bot.conversations_count || 0), 0);

  return {
    totalChatbots: totalChatbots ?? 0,
    totalConversations: totalConversations,
    responseRate: 92.5, // This remains a mock value as we don't track this data
  };
};

export const getChatbots = async (): Promise<ChatbotRecord[]> => {
  if (!supabase) throw new Error("Supabase not initialized");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('chatbots')
    .select('id, name, created_at, conversations_count')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Map Supabase data to the ChatbotRecord type
  return data.map(bot => ({
    id: bot.id,
    name: bot.name,
    createdAt: bot.created_at,
    monthlyConversations: bot.conversations_count,
    // Generate mock trend data as we don't store historical conversation counts
    conversationTrend: Array.from({ length: 7 }, () => Math.floor(Math.random() * ((bot.conversations_count || 1) / 30) + 5)),
  }));
};

/**
 * Fetches the full configuration of a single chatbot.
 * @param chatbotId The ID of the chatbot to fetch.
 * @returns A promise that resolves to the chatbot's configuration.
 */
export const getChatbotConfig = async (chatbotId: string): Promise<ChatbotConfig> => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from('chatbots')
    .select('config')
    .eq('id', chatbotId)
    .eq('user_id', user.id) // RLS also enforces this, but it's good practice
    .single();

  if (error) {
    console.error("Error fetching chatbot config:", error);
    throw new Error(`Failed to load chatbot configuration: ${error.message}`);
  }

  if (!data || !data.config) {
      throw new Error("Chatbot configuration not found.");
  }

  return data.config as ChatbotConfig;
};


// --- Admin Dashboard Data Functions ---

// Helper to parse price string like '$29.99' to a number
const parsePrice = (price: string): number => {
    return parseFloat(price.replace(/[^0-9.-]+/g, ""));
};

export const getAdminDashboardStats = async (plans: Plan[]): Promise<AdminDashboardStats> => {
    if (!supabase) throw new Error("Supabase not initialized");
    
    // Fetch all data in parallel
    const [usersResult, chatbotsResult] = await Promise.all([
        supabase.from('all_users').select('raw_user_meta_data'),
        supabase.from('chatbots').select('conversations_count')
    ]);

    if (usersResult.error) throw usersResult.error;
    if (chatbotsResult.error) throw chatbotsResult.error;
    
    const allUsersData = usersResult.data || [];
    const allChatbotsData = chatbotsResult.data || [];

    const totalUsers = allUsersData.length;
    const totalChatbots = allChatbotsData.length;
    const totalConversations = allChatbotsData.reduce((sum, bot) => sum + bot.conversations_count, 0);

    const monthlyRevenue = allUsersData.reduce((sum, user) => {
        const planName = user.raw_user_meta_data?.plan as string;
        const status = user.raw_user_meta_data?.status as string;

        // Note: For a real app, status would come from Stripe webhook data
        if (status !== 'Suspended' && planName) {
            const plan = plans.find(p => p.name === planName);
            if (plan && plan.price !== '$0') {
                return sum + parsePrice(plan.price);
            }
        }
        return sum;
    }, 0);

    return {
        totalUsers,
        totalChatbots,
        totalConversations,
        monthlyRevenue,
    };
};

export const getAllUsers = async (): Promise<UserRecord[]> => {
    if (!supabase) throw new Error("Supabase not initialized");
    
    const { data, error } = await supabase
        .from('all_users')
        .select('id, email, created_at, raw_user_meta_data');
        
    if (error) throw error;

    return data.map(user => ({
        id: user.id,
        email: user.email,
        plan: user.raw_user_meta_data?.plan || 'Free',
        status: user.raw_user_meta_data?.status || 'Active',
        role: user.raw_user_meta_data?.role || 'User',
        joinedAt: user.created_at,
        subscriptionStatus: user.raw_user_meta_data?.subscription_status || null,
        renewalDate: user.raw_user_meta_data?.subscription_renewal_date
            ? new Date(user.raw_user_meta_data.subscription_renewal_date * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : null,
    }));
};

export const updateUserRole = async (userId: string, newRole: 'User' | 'Admin'): Promise<void> => {
  if (!supabase) throw new Error("Supabase is not configured.");
  
  const { error } = await supabase.functions.invoke('update-user-role', {
      body: { userId, newRole },
  });

  if (error) {
    console.error(`Error invoking update-user-role function for user ${userId}:`, error);
    // Attempt to extract a more specific error message from the function's response
    let message = error.message;
    if (error.context && typeof error.context === 'object') {
        const context = error.context as any;
        if (context.error) {
            message = context.error;
        }
    }
    throw new Error(`Failed to update role: ${message}`);
  }
};

export const manageSubscription = async (userId: string, action: 'change' | 'cancel', newPriceId?: string): Promise<{ success: boolean; message?: string }> => {
    if (!supabase) throw new Error("Supabase is not configured.");
    
    const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { userId, action, newPriceId },
    });

    if (error) {
      console.error(`Error invoking manage-subscription function for user ${userId}:`, error);
      let message = error.message;
      if (error.context && typeof error.context === 'object') {
          const context = error.context as any;
          if (context.error) {
              message = context.error;
          }
      }
      throw new Error(`Failed to manage subscription: ${message}`);
    }
    
    return data;
};


export const getUserGrowthData = async (): Promise<UserGrowthDataPoint[]> => {
    if (!supabase) throw new Error("Supabase not initialized");

    const { data: users, error } = await supabase
        .from('all_users')
        .select('created_at');
    
    if (error) throw error;

    const today = new Date();
    const dates = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });

    const userCountsByDate: { [key: string]: number } = dates.reduce((acc, date) => ({ ...acc, [date]: 0 }), {});

    users.forEach(user => {
        const joinDate = user.created_at.split('T')[0];
        if (userCountsByDate[joinDate] !== undefined) {
            userCountsByDate[joinDate]++;
        }
    });

    return dates.map(date => ({
        date,
        count: userCountsByDate[date],
    }));
};

export const getPlanDistribution = async (): Promise<PlanDistribution> => {
    if (!supabase) throw new Error("Supabase not initialized");
    
    const { data: users, error } = await supabase
        .from('all_users')
        .select('raw_user_meta_data');
        
    if (error) throw error;
    
    const distribution: PlanDistribution = {
        free: 0,
        basic: 0,
        pro: 0,
    };

    users.forEach(user => {
        const plan = (user.raw_user_meta_data?.plan || 'Free') as string;
        const key = plan.toLowerCase() as keyof PlanDistribution;
        if (distribution.hasOwnProperty(key)) {
            distribution[key]++;
        }
    });

    return distribution;
};

// --- Plan Management Functions (Admin) ---

export const getPlans = async (): Promise<PlansResponse> => {
  if (!supabase) {
    console.warn("Supabase not initialized. Falling back to default plans.");
    return { plans: DEFAULT_PLANS, isDynamic: false };
  }
  
  const { data, error } = await supabase
    .from('plans')
    .select('id, name, price, price_detail, features, cta, featured, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    // Check for "table not found" error more robustly by inspecting the error message.
    // Supabase-js can return different error structures, so checking the message is safer.
    const isTableNotFoundError = 
        error.code === '42P01' || // PostgreSQL "undefined_table" code
        error.message.includes("relation \"public.plans\" does not exist") || // Raw PostgREST error
        error.message.includes("Could not find the table 'public.plans' in the schema cache"); // Supabase-js client error

    if (isTableNotFoundError) {
      console.warn("Could not find 'plans' table. Falling back to default plans. Please run the setup SQL in geminiService.ts to enable dynamic plan management.");
      return { plans: DEFAULT_PLANS, isDynamic: false };
    } else {
      // For other errors (network, etc.), re-throw so they can be handled upstream.
      console.error("Error fetching plans:", error);
      throw new Error(`Failed to load plans: ${error.message}`);
    }
  }
  
  // Map snake_case from DB to camelCase for JS consistency
  const plans = data.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    priceDetail: p.price_detail,
    features: p.features,
    cta: p.cta,
    featured: p.featured,
    sort_order: p.sort_order,
  }));
  
  return { plans, isDynamic: true };
};

export const updatePlan = async (plan: Plan): Promise<Plan> => {
  if (!supabase) throw new Error("Supabase not initialized");
  // Map camelCase from JS to snake_case for DB
  const { data, error } = await supabase
    .from('plans')
    .update({
        name: plan.name,
        price: plan.price,
        price_detail: plan.priceDetail,
        features: plan.features,
        cta: plan.cta,
        featured: plan.featured,
        sort_order: plan.sort_order,
    })
    .eq('id', plan.id)
    .select('id, name, price, price_detail, features, cta, featured, sort_order')
    .single();
  
  if (error) {
    console.error("Error updating plan:", error);
    // Provide a more user-friendly error message
    if (error.code === '42501') { // RLS violation
        throw new Error("Permission denied. You must be an admin to update plans.");
    }
    throw new Error(`Failed to update plan: ${error.message}`);
  }
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    priceDetail: data.price_detail,
    features: data.features,
    cta: data.cta,
    featured: data.featured,
    sort_order: data.sort_order,
  };
};
