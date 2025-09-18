

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Personality } from '../types';
import type { ChatbotConfig, DashboardStats, ChatbotRecord, FAQ, AdminDashboardStats, UserRecord, UserGrowthDataPoint, PlanDistribution, ActivityEvent } from '../types';
import { PLANS } from '../constants';

// --- IMPORTANT: CONFIGURE YOUR SUPABASE CREDENTIALS ---
// You can find these in your Supabase project dashboard under:
// Project Settings > API
//
// 1. supabaseUrl: Your project's URL.
// 2. supabaseAnonKey: Your project's "anon" public key.
//
// NOTE: Do NOT use the "service_role" key here, as it's not secure for the browser.
// Also, do NOT use the "publishable" key; you need the "anon" key for authentication.
const supabaseUrl: string = 'https://iezxuhaxapklxuxybgci.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllenh1aGF4YXBrbHh1eHliZ2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTEzNDAsImV4cCI6MjA3MjkyNzM0MH0.iTPlc2IcZR1Fz_Og3czXRw4ngtW1PgjY1e9ldLPixxo';

let supabaseSingleton: SupabaseClient | null = null;
let supabaseInitializationError: string | null = null;

// --- Dynamic Session Persistence ---
let persist = true; // Default to localStorage for "Remember me" behavior

/**
 * Sets the persistence strategy for the Supabase auth client.
 * @param shouldPersist If true, uses localStorage. If false, uses sessionStorage.
 */
export const setAuthPersistence = (shouldPersist: boolean) => {
  persist = shouldPersist;
};

// Custom storage handler that delegates to either localStorage or sessionStorage
// based on the 'persist' flag, controlled by the "Remember me" checkbox.
const customStorage = {
  getItem: (key: string) => {
    return (persist ? localStorage : sessionStorage).getItem(key);
  },
  setItem: (key: string, value: string) => {
    (persist ? localStorage : sessionStorage).setItem(key, value);
  },
  removeItem: (key: string) => {
    (persist ? localStorage : sessionStorage).removeItem(key);
  },
};


// Always attempt to create the Supabase client.
// The `try...catch` block will handle errors from invalid credentials (including the initial placeholders)
// and provide a specific error message to the user.
try {
  supabaseSingleton = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // This is replaced by the custom storage handler below to allow for
      // dynamic persistence (e.g., "Remember me" functionality).
      // persistSession: true, 
      storage: customStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  // After attempting to create the client, explicitly check if the placeholders are still there.
  // The createClient function might not throw an error for a valid-looking but incorrect API key.
  if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    // We clear the singleton to prevent the app from trying to use a client configured with placeholder values.
    supabaseSingleton = null; 
    // This custom error will be caught and used to display the `ConfigurationNeeded` component.
    throw new Error("Action Required: Configure Supabase credentials in `services/geminiService.ts`.");
  }

} catch (error) {
  console.error("Supabase initialization error:", error);
  // Store the error message to be displayed to the user via the appropriate error component.
  supabaseInitializationError = error instanceof Error 
      ? error.message 
      : "An unknown error occurred during Supabase client creation.";
}

export const supabase: SupabaseClient | null = supabaseSingleton;
export const initializationError: string | null = supabaseInitializationError;


// --- INSTRUCTIONS FOR DATABASE SETUP ---
/**
 * To enable real-time data, you need to set up three things in your Supabase project:
 *
 * 1. A 'chatbots' table with Row Level Security (RLS):
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
 *    -- Drop old policies that might exist
 *    DROP POLICY IF EXISTS "Users can manage their own chatbots" ON public.chatbots;
 *
 *    -- Create specific, secure policies for each action
 *    CREATE POLICY "Users can view their own chatbots" ON public.chatbots
 *      FOR SELECT USING (auth.uid() = user_id);
 *    CREATE POLICY "Users can insert their own chatbots" ON public.chatbots
 *      FOR INSERT WITH CHECK (auth.uid() = user_id);
 *    CREATE POLICY "Users can update their own chatbots" ON public.chatbots
 *      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
 *    CREATE POLICY "Users can delete their own chatbots" ON public.chatbots
 *      FOR DELETE USING (auth.uid() = user_id);
 *
 *
 * 2. An 'all_users' view for the Admin Dashboard:
 *    This view and its associated permissions allow the admin user to see user data.
 *    Run this entire block as a single script in your Supabase SQL Editor.
 *
 *    -- Create the view using 'security_definer' to grant access to the 'auth.users' table.
 *    CREATE OR REPLACE VIEW public.all_users
 *    WITH (security_definer)
 *    AS SELECT
 *      id, email, raw_user_meta_data, created_at, last_sign_in_at
 *    FROM auth.users;
 *
 *    -- =====================================================================================
 *    -- !! CRITICAL PERMISSION STEP !!
 *    -- =====================================================================================
 *    -- The following GRANT statement is MANDATORY for the Admin Dashboard to work.
 *    --
 *    -- WHY IS THIS NEEDED?
 *    -- Your web app uses a public-facing "anon" key. For security, this key cannot see
 *    -- any tables or views by default. This GRANT command makes the 'all_users' view
 *    -- VISIBLE to your app. The Row Level Security (RLS) policy below then ensures
 *    -- that only the specified admin can actually READ THE DATA.
 *    --
 *    -- WHAT HAPPENS IF YOU SKIP THIS?
 *    -- You will see errors in your browser console like:
 *    -- "Failed to fetch users: Could not find the table 'public.all_users' in the schema cache (Code: PGRST205)"
 *    -- This command directly fixes that error.
 *    -- =====================================================================================
 *    GRANT SELECT ON public.all_users TO anon, authenticated;
 *
 *    -- Enable Row Level Security (RLS) on the view.
 *    ALTER VIEW public.all_users OWNER TO postgres;
 *    ALTER VIEW public.all_users ENABLE ROW LEVEL SECURITY;
 *
 *    -- Drop old policies to ensure a clean setup.
 *    DROP POLICY IF EXISTS "Allow admin to read all users" ON public.all_users;
 *    DROP POLICY IF EXISTS "Allow specific admin user to read all users" ON public.all_users;
 *
 *    -- Create the RLS policy. This is the second layer of security.
 *    -- It ensures that even though the view is visible, only the specified admin's email can actually read the data.
 *    -- IMPORTANT: Replace the placeholder email with YOUR admin email address.
 *    CREATE POLICY "Allow specific admin user to read all users" ON public.all_users
 *      FOR SELECT USING (auth.email() = 'zebsnellenbarger60@gmail.com');
 *
 *
 * 3. An 'all_chatbots' view for the Admin Dashboard:
 *    This view and its permissions allow the admin to see all chatbot data.
 *    Run this entire block as a single script in your Supabase SQL Editor.
 *
 *    -- Create the view using 'security_definer' to access all rows in 'public.chatbots'.
 *    CREATE OR REPLACE VIEW public.all_chatbots
 *    WITH (security_definer)
 *    AS SELECT * FROM public.chatbots;
 *
 *    -- =====================================================================================
 *    -- !! CRITICAL PERMISSION STEP !!
 *    -- =====================================================================================
 *    -- Just like the 'all_users' view, this GRANT statement is MANDATORY.
 *    -- Without it, your application (using the anon key) cannot see that the view
 *    -- exists, which will result in schema cache errors (PGRST205).
 *    -- RLS then provides the actual data security.
 *    -- =====================================================================================
 *    GRANT SELECT ON public.all_chatbots TO anon, authenticated;
 *
 *    -- Enable Row Level Security (RLS) on the view.
 *    ALTER VIEW public.all_chatbots OWNER TO postgres;
 *    ALTER VIEW public.all_chatbots ENABLE ROW LEVEL SECURITY;
 *
 *    -- Drop old policies to ensure a clean setup.
 *    DROP POLICY IF EXISTS "Allow admin to read all chatbots" ON public.all_chatbots;
 *
 *    -- Create the RLS policy to restrict data access to only the specified admin.
 *    -- IMPORTANT: Replace the placeholder email with YOUR admin email address.
 *    CREATE POLICY "Allow admin to read all chatbots" ON public.all_chatbots
 *      FOR SELECT USING (auth.email() = 'zebsnellenbarger60@gmail.com');
 *
 */

export const generateChatbotScript = async (config: ChatbotConfig): Promise<string> => {
  // A guard clause ensures Supabase is configured before invoking a function.
  if (!supabase) throw new Error("Supabase is not configured. Cannot generate script.");
  
  const { data, error } = await supabase.functions.invoke('generate-chatbot-script', {
    body: { config },
  });

  // If the invoke call itself fails (e.g., network, 5xx error), 'error' will be populated.
  if (error) {
    console.error("Error invoking Supabase function:", error);
    
    // Attempt to extract the detailed error message from the function's response body.
    let detailedMessage = "An unexpected error occurred while contacting the script generation service."; // Default message
    if (error.context && typeof (error.context as any).json === 'function') {
        try {
            const errorJson = await (error.context as any).json();
            if (errorJson && errorJson.error) {
                // This is the specific error message from the backend function.
                detailedMessage = errorJson.error;
            }
        } catch (e) {
            // If parsing fails, fall back to the generic invoke error message.
            detailedMessage = error.message;
        }
    } else {
        detailedMessage = error.message;
    }

    // Throw a new, more informative error to be caught by the UI.
    throw new Error(detailedMessage);
  }

  // If the function returns 200 OK, but contains an error payload (less common for my setup, but good practice).
  if (data.error) {
      throw new Error(data.error);
  }

  // If everything is successful, return the script.
  if (data && typeof data.script === 'string') {
    return data.script;
  } 
  
  // If we reach here, the response format is invalid.
  throw new Error("Invalid response format from the server. Expected a 'script' property.");
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
 * and redirects the current window to the Stripe-hosted checkout page.
 *
 * @param {string} priceId The ID of the Stripe Price object.
 * @throws Will throw an error if the checkout session cannot be created or if the server response is invalid.
 */
export const redirectToCheckout = async (priceId: string) => {
  if (!supabase) throw new Error("Supabase is not configured. Cannot redirect to checkout.");

  try {
    const { data, error: invokeError } = await supabase.functions.invoke('create-checkout', {
      body: { priceId },
    });

    if (invokeError) {
      let detailedMessage = invokeError.message; // Default to the generic message.

      // Supabase Function errors often contain a `context` property with the Response object.
      // We try to parse the JSON body of this response to get a more specific error message
      // that we've set in the Edge Function itself.
      if (invokeError.context && typeof invokeError.context.json === 'function') {
        try {
          const errorJson = await invokeError.context.json();
          if (errorJson && errorJson.error) {
            detailedMessage = errorJson.error;
          }
        } catch (e) {
          // If the body isn't valid JSON, we'll just fall back to the generic message.
          console.error("Could not parse JSON from function error response.", e);
        }
      }
      throw new Error(detailedMessage);
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.url) {
      const checkoutWindow = window.open(data.url, '_blank');
      if (!checkoutWindow) {
        throw new Error(
          "Your browser blocked the pop-up.\n\nPlease copy and paste the following URL into a new tab to complete your checkout:\n\n" + data.url
        );
      }
    } else {
      throw new Error("No checkout URL returned from the server. This could be due to an invalid Price ID or server configuration issue.");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during checkout.";
    // The error is thrown and displayed in the UI modal, so the console.error is redundant.
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

export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  if (!supabase) throw new Error("Supabase not initialized");
  if (!userId) throw new Error("User ID is required.");

  const { count: totalChatbots, error: chatbotsError } = await supabase
    .from('chatbots')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (chatbotsError) {
    console.error('Error fetching chatbot stats:', chatbotsError);
    // Provide a more descriptive error message to aid debugging.
    throw new Error(`Failed to fetch dashboard stats: ${chatbotsError.message} (Code: ${chatbotsError.code})`);
  }

  const { data: conversationsData, error: convosError } = await supabase
    .from('chatbots')
    .select('conversations_count')
    .eq('user_id', userId);
  
  if (convosError) {
    console.error('Error fetching conversation stats:', convosError);
    // Provide a more descriptive error message.
    throw new Error(`Failed to fetch conversation stats: ${convosError.message} (Code: ${convosError.code})`);
  }

  // Defensively reduce: ensure data is an array and each item is valid.
  const totalConversations = Array.isArray(conversationsData)
    ? conversationsData.reduce((sum, bot) => {
        // Check if bot is a valid object with the expected property.
        if (bot && typeof bot.conversations_count === 'number') {
          return sum + bot.conversations_count;
        }
        return sum;
      }, 0)
    : 0;

  return {
    totalChatbots: totalChatbots ?? 0,
    totalConversations: totalConversations,
    responseRate: 92.5, // This remains a mock value as we don't track this data
  };
};

export const getChatbots = async (userId: string): Promise<ChatbotRecord[]> => {
  if (!supabase) throw new Error("Supabase not initialized");
  if (!userId) throw new Error("User ID is required.");

  const { data, error } = await supabase
    .from('chatbots')
    .select('id, name, created_at, conversations_count, config')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chatbots list:', error);
    throw new Error(`Failed to fetch chatbots: ${error.message} (Code: ${error.code})`);
  }
  
  if (!Array.isArray(data)) {
    return []; // Return empty array if data is null or not an array
  }

  // Filter out any potentially null/invalid records and map to ChatbotRecord type
  return data
    .filter(bot => bot && bot.id) // Basic validation: ensure bot object and id exist
    .map(bot => {
      // Create a default config structure to merge against.
      // This is a defensive measure to prevent crashes if a chatbot record
      // in the database has a malformed or incomplete 'config' object.
      const defaultConfig: ChatbotConfig = {
          businessInfo: { 
              name: bot.name || 'Untitled', 
              description: '', 
              website: '' 
          },
          personality: Personality.Friendly,
          // CRITICAL: Ensure faqs is always an array to prevent .map errors.
          faqs: [], 
          appearance: { 
              logo: null, 
              colors: { 
                  primary: '#7C3AED', 
                  botMessage: '#F3F4F6', 
                  text: '#1F2937' 
              }, 
              fontFamily: 'Inter' 
          }
      };

      // Deeply merge the stored config over the default.
      // This ensures that even if bot.config exists but is missing nested properties
      // (like 'faqs' or 'colors'), the final config object is complete and safe to use.
      const finalConfig: ChatbotConfig = {
          ...defaultConfig,
          ...(bot.config || {}),
          businessInfo: {
              ...defaultConfig.businessInfo,
              ...(bot.config?.businessInfo || {}),
              // Ensure the chatbot's name from the top-level record is used if the config is missing it.
              name: bot.config?.businessInfo?.name || bot.name || 'Untitled'
          },
          // Explicitly ensure 'faqs' is an array, falling back to an empty one. This is the most common point of failure.
          faqs: bot.config?.faqs || [],
          appearance: {
              ...defaultConfig.appearance,
              ...(bot.config?.appearance || {}),
              colors: {
                  ...defaultConfig.appearance.colors,
                  ...(bot.config?.appearance?.colors || {})
              }
          }
      };

      return {
        id: bot.id,
        name: bot.name || 'Untitled Chatbot',
        createdAt: bot.created_at || new Date().toISOString(),
        monthlyConversations: bot.conversations_count ?? 0,
        config: finalConfig, // Use the sanitized config
        conversationTrend: Array.from({ length: 7 }, () => Math.floor(Math.random() * (((bot.conversations_count ?? 0) || 1) / 30) + 5)),
      };
    });
};

export const deleteChatbot = async (chatbotId: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', chatbotId);

    if (error) {
        console.error("Error deleting chatbot:", error);
        throw new Error(`Failed to delete chatbot: ${error.message}`);
    }
};


// --- Admin Dashboard Data Functions ---

// Helper to parse price string like '$29.99' to a number
const parsePrice = (price: string): number => {
    return parseFloat(price.replace(/[^0-9.-]+/g, ""));
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
    if (!supabase) throw new Error("Supabase not initialized");

    // Define paid plans to filter for revenue calculation
    const paidPlanNames = PLANS.filter(p => p.price !== '$0').map(p => p.name);

    // Fetch counts and data in parallel with optimized queries
    const [usersCountResult, chatbotsResult, paidUsersResult] = await Promise.all([
        // Query 1: Get total user count efficiently without fetching row data.
        supabase.from('all_users').select('*', { count: 'exact', head: true }),
        
        // Query 2: Get all chatbot data for chatbot and conversation counts.
        // Note: This still fetches all conversation counts, which could be slow on an
        // extremely large scale, but is much better than fetching all user data.
        supabase.from('all_chatbots').select('conversations_count', { count: 'exact' }),
        
        // Query 3: Fetch ONLY users on paid plans for revenue calculation.
        // This is a much smaller and more performant query than fetching all users.
        supabase.from('all_users')
          .select('raw_user_meta_data')
          .filter('raw_user_meta_data->>plan', 'in', `(${paidPlanNames.join(',')})`)
    ]);

    // FIX: Throw descriptive errors instead of the raw error object to prevent "[object Object]" logs.
    if (usersCountResult.error) {
        throw new Error(`Failed to fetch user stats: ${usersCountResult.error.message}`);
    }
    if (chatbotsResult.error) {
        throw new Error(`Failed to fetch chatbot stats: ${chatbotsResult.error.message}`);
    }
    if (paidUsersResult.error) {
        throw new Error(`Failed to fetch paid user data: ${paidUsersResult.error.message}`);
    }
    
    // Process results
    const totalUsers = usersCountResult.count ?? 0;
    const totalChatbots = chatbotsResult.count ?? 0;
    
    const totalConversations = (chatbotsResult.data || []).reduce(
      (sum, bot) => sum + (bot.conversations_count || 0), 0
    );

    const monthlyRevenue = (paidUsersResult.data || []).reduce((sum, user) => {
        const planName = user.raw_user_meta_data?.plan as string;
        const status = user.raw_user_meta_data?.status as string;

        // Note: For a real app, subscription status would come from Stripe webhook data
        if (status !== 'Suspended' && planName) {
            const plan = PLANS.find(p => p.name === planName);
            // The plan should always be found because we filtered for them.
            if (plan) {
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
        .select('id, email, created_at, raw_user_meta_data, last_sign_in_at');
        
    if (error) {
      throw new Error(`Failed to fetch users: ${error.message} (Code: ${error.code})`);
    }
    
    // CRITICAL FIX: Handle cases where the query returns no data (null) to prevent crashes.
    if (!data) return [];

    return data.map(user => ({
        id: user.id,
        email: user.email,
        plan: user.raw_user_meta_data?.plan || 'None',
        status: user.raw_user_meta_data?.status || 'Active',
        role: user.raw_user_meta_data?.role || 'User',
        // Defensively provide a fallback for the join date.
        joinedAt: user.created_at || new Date().toISOString(),
        lastSignInAt: user.last_sign_in_at,
        subscriptionStatus: user.raw_user_meta_data?.subscription_status || null,
        renewalDate: user.raw_user_meta_data?.subscription_renewal_date
            ? new Date(user.raw_user_meta_data.subscription_renewal_date * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : null,
        raw_user_meta_data: user.raw_user_meta_data || {},
    }));
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
    
    if (error) {
      throw new Error(`Failed to fetch user growth data: ${error.message} (Code: ${error.code})`);
    }
    
    // CRITICAL FIX: Handle null response from the database.
    if (!users) return [];

    const today = new Date();
    const dates = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });

    const userCountsByDate: { [key: string]: number } = dates.reduce((acc, date) => ({ ...acc, [date]: 0 }), {});

    users.forEach(user => {
        // Defensively check for user and created_at to avoid errors on malformed records.
        if (user && user.created_at) {
            const joinDate = user.created_at.split('T')[0];
            if (userCountsByDate[joinDate] !== undefined) {
                userCountsByDate[joinDate]++;
            }
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
        
    if (error) {
      throw new Error(`Failed to fetch plan distribution: ${error.message} (Code: ${error.code})`);
    }
    
    const distribution: PlanDistribution = {
        free: 0,
        basic: 0,
        pro: 0,
    };
    
    // CRITICAL FIX: Handle null response and return the default distribution.
    if (!users) return distribution;

    users.forEach(user => {
        // The existing logic here is already safe with optional chaining and fallbacks.
        const plan = (user.raw_user_meta_data?.plan || 'Free') as string;
        const key = plan.toLowerCase() as keyof PlanDistribution;
        if (distribution.hasOwnProperty(key)) {
            distribution[key]++;
        }
    });

    return distribution;
};

export const getAdminActivityFeed = async (): Promise<ActivityEvent[]> => {
    // In a real application, this would fetch data from a dedicated 'activity_log' table.
    // For this demo, we'll generate mock data based on the latest users and chatbots.
    if (!supabase) throw new Error("Supabase not initialized");

    const [usersResult, chatbotsResult, subscriptionEventsResult] = await Promise.all([
        supabase.from('all_users').select('email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('all_chatbots').select('name, created_at, user_id').order('created_at', { ascending: false }).limit(5),
        // Fetch users with subscription data to simulate subscription events
        supabase.from('all_users')
            .select('email, raw_user_meta_data, created_at, last_sign_in_at')
            .in('raw_user_meta_data->>subscription_status', ['active', 'trialing', 'canceled'])
            .order('last_sign_in_at', { ascending: false, nullsFirst: true })
            .limit(5)
    ]);

    if (usersResult.error) throw usersResult.error;
    if (chatbotsResult.error) throw chatbotsResult.error;
    if (subscriptionEventsResult.error) throw subscriptionEventsResult.error;

    const userActivities: ActivityEvent[] = (usersResult.data || []).map(user => ({
        id: `user-${user.created_at}`,
        type: 'user_signup',
        description: 'New user signed up.',
        userEmail: user.email,
        timestamp: user.created_at,
    }));
    
    const chatbotsData = chatbotsResult.data || [];
    const chatbotUserIds = chatbotsData.map(bot => bot.user_id);
    let userEmailMap = new Map<string, string>();

    if (chatbotUserIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
            .from('all_users')
            .select('id, email')
            .in('id', chatbotUserIds);
        
        if (usersError) throw usersError;

        if (usersData) {
            userEmailMap = usersData.reduce((map, user) => {
                map.set(user.id, user.email);
                return map;
            }, new Map<string, string>());
        }
    }

    const chatbotActivities: ActivityEvent[] = chatbotsData.map(bot => ({
        id: `bot-${bot.created_at}`,
        type: 'chatbot_created',
        description: `Created chatbot: ${bot.name}`,
        userEmail: userEmailMap.get(bot.user_id) || 'Unknown User', 
        timestamp: bot.created_at,
    }));

    const subscriptionActivities: ActivityEvent[] = (subscriptionEventsResult.data || [])
        // FIX: Explicitly type the return value of the map function to guide TypeScript's inference,
        // which resolves the type predicate error in the subsequent filter.
        .map((user): ActivityEvent | null => {
            const planName = user.raw_user_meta_data?.plan || 'Unknown Plan';
            const status = user.raw_user_meta_data?.subscription_status;
            // Use last sign-in as a proxy for the event timestamp, falling back to join date.
            const timestamp = user.last_sign_in_at || user.created_at;

            if (status === 'active' || status === 'trialing') {
                return {
                    id: `sub-start-${user.email}-${timestamp}`,
                    type: 'subscription_started' as const,
                    description: `Started ${planName} plan.`,
                    userEmail: user.email,
                    timestamp: timestamp,
                };
            } else if (status === 'canceled') {
                return {
                    id: `sub-cancel-${user.email}-${timestamp}`,
                    type: 'subscription_canceled' as const,
                    description: `Canceled ${planName} plan.`,
                    userEmail: user.email,
                    timestamp: timestamp,
                };
            }
            return null;
        })
        .filter((event): event is ActivityEvent => event !== null);

    // Combine, sort by date, and take the most recent events
    return [...userActivities, ...chatbotActivities, ...subscriptionActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
};


export const updateUserStatus = async (userIds: string[], status: 'Active' | 'Suspended'): Promise<{ success: boolean; message?: string }> => {
    if (!supabase) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { userIds, status },
    });

    if (error) {
        console.error(`Error invoking manage-users function:`, error);
        let message = error.message;
        if (error.context && typeof (error.context as any).json === 'function') {
            try {
                const contextError = await (error.context as any).json();
                if (contextError.error) {
                    message = contextError.error;
                }
            } catch (e) { /* ignore json parse error */ }
        }
        throw new Error(`Failed to update user status: ${message}`);
    }
    
    return data;
};