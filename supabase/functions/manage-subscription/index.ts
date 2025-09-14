// supabase/functions/manage-subscription/index.ts

// This function allows an admin to manage a user's Stripe subscription.
// - Change a user's plan to a new Price ID.
// - Cancel a user's subscription at the end of the billing period.
//
// Required Environment Variables:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY (for authenticating the calling user)
// - SUPABASE_SERVICE_ROLE_KEY (for admin actions)
// - STRIPE_SECRET_KEY
//
// Deployment:
// supabase functions deploy manage-subscription

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !stripeSecretKey) {
      throw new Error("Server configuration error: Missing required environment variables.");
    }
    
    // 1. Authenticate the user making the request.
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('Missing Authorization header.');
    }
    const userSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } }
    });
    const { data: { user: callingUser }, error: authError } = await userSupabaseClient.auth.getUser();
    if (authError || !callingUser) {
        throw new Error("Authentication failed: " + (authError?.message || 'No user found'));
    }

    // 2. Authorize: Check if the calling user is an admin.
    if (callingUser.user_metadata?.role !== 'Admin') {
      return new Response(JSON.stringify({ error: 'Permission denied. You are not an admin.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Validate request body
    const { userId, action, newPriceId } = await req.json();
    if (!userId || !action || (action === 'change' && !newPriceId)) {
        throw new Error("Invalid request: 'userId' and 'action' are required. 'newPriceId' is required for 'change' action.");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
        httpClient: Stripe.createFetchHttpClient(),
        apiVersion: '2024-06-20',
    });

    // Use admin client to get target user's data
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: targetUserData, error: userFetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userFetchError) throw userFetchError;

    const stripeCustomerId = targetUserData.user?.user_metadata?.stripe_customer_id;
    if (!stripeCustomerId) {
        throw new Error(`User ${userId} does not have a Stripe customer ID.`);
    }

    // Find the user's active subscription in Stripe
    const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all', // Fetch active, trialing, etc. but not canceled ones by default
        limit: 1,
    });
    const subscription = subscriptions.data.find(s => s.status !== 'canceled');
    if (!subscription) {
        throw new Error(`No active subscription found for user ${userId}.`);
    }

    // 4. Perform the requested action
    let result;
    if (action === 'cancel') {
      result = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
      console.log(`Subscription ${subscription.id} for user ${userId} set to cancel at period end.`);
    } else if (action === 'change') {
      const currentItemId = subscription.items.data[0]?.id;
      if (!currentItemId) {
          throw new Error('Could not find a subscription item to update.');
      }
      result = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: false, // Ensure it's not set to cancel if we're changing the plan
        items: [{
          id: currentItemId,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations',
      });
      console.log(`Subscription ${subscription.id} for user ${userId} changed to price ${newPriceId}.`);
    } else {
        throw new Error(`Invalid action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, subscription: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in manage-subscription function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});