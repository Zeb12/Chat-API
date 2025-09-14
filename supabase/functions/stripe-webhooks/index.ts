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
  const planId = subscription.items.data[0].price.id;
  const status = subscription.status;
  // Stripe sends current_period_end as a UNIX timestamp (seconds since epoch)
  const renewalDate = subscription.current_period_end;

  // Find the Supabase user associated with this Stripe customer ID.
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users') // This correctly queries the 'auth.users' table
    .select('id, raw_user_meta_data')
    .eq('raw_user_meta_data->>stripe_customer_id', customerId)
    .single();

  if (userError || !userData) {
    console.error(`User not found for Stripe customer ID: ${customerId}`, userError);
    // Return a 200 to Stripe even if the user isn't found to prevent retries for non-existent users.
    return;
  }
  
  const userId = userData.id;
  const existingMetadata = userData.raw_user_meta_data || {};

  // Update the user's metadata with the new subscription details.
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        ...existingMetadata,
        subscription_plan_id: planId,
        subscription_status: status,
        subscription_renewal_date: renewalDate,
      },
    }
  );

  if (updateError) {
    console.error(`Failed to update user ${userId}:`, updateError);
    throw updateError;
  }

  console.log(`Successfully updated subscription for user ${userId} to plan ${planId} with status ${status}.`);
};

serve(async (req) => {
  // Handle preflight CORS requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // FIX: Move all client initializations and env var checks inside the handler.
    // This is a critical change to prevent the function from crashing on startup
    // if environment variables are missing. A startup crash is a common cause of
    // CORS errors because the function can't respond to the preflight OPTIONS request.
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const signingSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !signingSecret || !supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Webhook configuration error: Missing required environment variables.");
      throw new Error("Webhook server is not configured correctly.");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2024-06-20',
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'auth' },
    });

    const signature = req.headers.get('Stripe-Signature');
    const body = await req.text();

    if (!signature) {
      throw new Error('Missing Stripe-Signature header.');
    }

    // Verify the webhook signature to ensure the request is from Stripe.
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      signingSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );

    // Handle the specific webhook event types.
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await updateUserSubscription(supabaseAdmin, subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt of the event to Stripe.
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return new Response(JSON.stringify({ error: `Webhook error: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Bad Request for signature errors
    });
  }
});
