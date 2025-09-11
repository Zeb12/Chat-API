// supabase/functions/stripe-webhooks/index.ts

// This function handles Stripe webhooks to keep user subscription data in sync.
//
// Required Environment Variables:
// - SUPABASE_URL: Your Supabase project URL.
// - SUPABASE_SERVICE_ROLE_KEY: Your project's service_role key for admin access.
// - STRIPE_SECRET_KEY: Your Stripe secret key.
// - STRIPE_WEBHOOK_SIGNING_SECRET: The signing secret from your Stripe webhook configuration.
//
// Deployment:
// supabase functions deploy stripe-webhooks --no-verify-jwt
//
// Stripe Setup:
// 1. Create a webhook endpoint in your Stripe dashboard.
// 2. Set the endpoint URL to: https://<your-project-ref>.supabase.co/functions/v1/stripe-webhooks
// 3. Listen for events: 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';


// This function updates the user's metadata in Supabase Auth.
const updateUserSubscription = async (supabaseAdmin: SupabaseClient, subscription: Stripe.Subscription) => {
  const customerId = subscription.customer as string;
  
  // Use the price's nickname from Stripe to identify the plan (e.g., 'Basic', 'Pro').
  // This is a reliable way to sync plan names.
  const planName = subscription.items.data[0]?.price?.nickname || null;
  const status = subscription.status;
  
  // Stripe sends current_period_end as a UNIX timestamp (seconds since epoch).
  const renewalDate = subscription.current_period_end;
  const isCanceledAtPeriodEnd = subscription.cancel_at_period_end;
  
  // Determine the unified subscription status.
  const subscriptionStatus = isCanceledAtPeriodEnd || status === 'canceled' ? 'canceled' : status;

  // Find the Supabase user associated with this Stripe customer ID.
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users') // Correctly queries the 'auth.users' table
    .select('id, raw_user_meta_data')
    .eq('raw_user_meta_data->>stripe_customer_id', customerId)
    .single();

  if (userError) throw userError;
  if (!userData) {
    console.warn(`Webhook Error: User with Stripe customer ID ${customerId} not found.`);
    // Return successfully so Stripe doesn't retry for a user that doesn't exist.
    return;
  }
  
  const userId = userData.id;
  const currentMetaData = userData.raw_user_meta_data || {};
  
  // Prepare the metadata to be updated, preserving existing data.
  const newMetaData = {
    ...currentMetaData,
    plan: planName || currentMetaData.plan || 'Free', // Fallback to existing or free
    subscription_status: subscriptionStatus,
    subscription_renewal_date: renewalDate,
  };
  
  // If a subscription is fully deleted (not just set to cancel), revert the user to a free plan.
  if (status === 'canceled') {
      newMetaData.plan = 'Free';
      delete newMetaData.subscription_renewal_date; // No renewal date for a canceled plan
  }

  // Update the user's metadata in Supabase Auth.
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: newMetaData }
  );

  if (updateError) throw updateError;
  
  console.log(`Successfully updated subscription for user ${userId} to status: ${subscriptionStatus}`);
};

// The main server function that handles incoming webhook requests.
serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeSigningSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');

    if (!supabaseUrl || !supabaseServiceRoleKey || !stripeSecretKey || !stripeSigningSecret) {
        throw new Error("Server configuration error: Missing required environment variables for Stripe webhooks.");
    }

    const stripe = new Stripe(stripeSecretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2024-06-20',
    });
    
    // Create a Supabase admin client to perform privileged operations.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error("Missing 'stripe-signature' header.");
    }
    
    const body = await req.text();
    // Verify the webhook signature to ensure the request is from Stripe.
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeSigningSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );

    // Handle the specific webhook event.
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await updateUserSubscription(supabaseAdmin, event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 OK response to Stripe to acknowledge receipt.
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Use 400 for bad requests (e.g., invalid signature)
    });
  }
});