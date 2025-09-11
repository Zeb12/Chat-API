// FIX: Add a type declaration for the Deno global object to resolve "Cannot find name 'Deno'"
// errors that can occur in local development environments or linters without Deno types configured.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

// The main server function that handles incoming requests.
serve(async (req) => {
  // Handle preflight CORS requests. This is crucial for browser security.
  // Using a 200 OK response is a more common and robust way to handle this.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check for required environment variables. This prevents the function from
    // crashing on startup and ensures that CORS preflight requests can be handled
    // even if the configuration is incomplete.
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const siteUrl = Deno.env.get('SITE_URL');

    if (!stripeSecretKey || !supabaseUrl || !supabaseAnonKey || !siteUrl) {
      console.error("Server configuration error: Missing required environment variables.");
      throw new Error("Server is not configured correctly. Please check environment variables.");
    }
    
    // Initialize the Stripe client.
    const stripe = new Stripe(stripeSecretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2024-06-20',
    });

    const { priceId } = await req.json();
    if (!priceId) {
      throw new Error("Missing 'priceId' in request body.");
    }

    // Securely get the Authorization header, which contains the user's JWT.
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header. User must be logged in.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }
    
    // Create a Supabase client with the authentication context of the logged-in user.
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authorization } } }
    );

    // Get the user from the session.
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    if (!user) {
       return new Response(
        JSON.stringify({ error: 'Authentication error: Invalid or expired token. Please log in again.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Check if the user already has a Stripe customer ID in their Supabase metadata.
    let customerId = user.user_metadata?.stripe_customer_id;

    // If not, create a new Stripe customer and link it to the Supabase user.
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!, // Email is guaranteed for authenticated users
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
      // Save the new Stripe customer ID to the user's metadata in Supabase.
      await supabaseClient.auth.updateUser({
        data: { stripe_customer_id: customerId },
      });
    }

    // Create the Stripe Checkout Session.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // These URLs are where Stripe will redirect the user after checkout.
      success_url: `${siteUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: siteUrl,
    });

    // Return the checkout session URL to the frontend.
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});