// supabase/functions/create-checkout/index.ts

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

async function handler(req: Request) {
  // Immediately handle preflight OPTIONS requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("create-checkout function invoked.");

    // 1. Securely initialize all required clients and variables.
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const siteUrl = Deno.env.get('SITE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !supabaseUrl || !supabaseAnonKey || !siteUrl || !supabaseServiceRoleKey) {
      throw new Error("Server configuration error: One or more required environment variables are missing. Please check your Supabase project secrets.");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2024-06-20',
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    console.log("Clients initialized.");

    // 2. Authenticate the user making the request.
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('Authorization header is missing.');
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authorization } } }
    );
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    if (!user) {
      throw new Error('Authentication failed. User not found.');
    }
    console.log(`User ${user.id} authenticated.`);

    // 3. Parse the request body.
    const { priceId } = await req.json();
    if (!priceId) {
      throw new Error("Request body must include a 'priceId'.");
    }
    console.log(`Received request for priceId: ${priceId}`);

    // 4. Get or create a Stripe Customer for the Supabase user.
    let customerId = user.user_metadata?.stripe_customer_id;
    if (!customerId) {
      console.log(`Creating Stripe customer for user: ${user.id}`);
      
      const customerCreateParams: Stripe.CustomerCreateParams = {
        metadata: { supabase_user_id: user.id },
      };
      if (user.email) {
        customerCreateParams.email = user.email;
      }

      const customer = await stripe.customers.create(customerCreateParams);
      customerId = customer.id;
      console.log(`Stripe customer ${customerId} created.`);

      // CRITICAL FIX: Defensively handle user.user_metadata.
      // If a new user (e.g., via OAuth) has null metadata, spreading it
      // directly (`...user.user_metadata`) would cause a TypeError and crash the function.
      // This ensures metadata is always an object before spreading.
      const existingMetadata = (typeof user.user_metadata === 'object' && user.user_metadata !== null) 
          ? user.user_metadata 
          : {};

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...existingMetadata, stripe_customer_id: customerId } }
      );
      if (updateError) {
        throw new Error(`Failed to link Stripe customer to user account: ${updateError.message}`);
      }
      console.log(`User ${user.id} metadata updated with Stripe customer ID.`);
    } else {
      console.log(`Found existing Stripe customer ID: ${customerId}`);
    }

    // 5. Create the Stripe Checkout Session.
    console.log("Creating Stripe checkout session.");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${siteUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: siteUrl,
      metadata: {
        supabase_user_id: user.id,
      }
    });

    // 6. Return the checkout URL to the client.
    console.log("Checkout session created successfully. Returning URL.");
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Log the full error object for better debugging in Supabase Function logs.
    // FIX: Using a simple console.error() is safer than JSON.stringify, as error
    // objects from libraries like Stripe can contain circular references, which
    // would crash the stringify operation and prevent a response from being sent.
    console.error('CRITICAL ERROR in create-checkout function:', error);

    // Construct a more helpful and specific error message for the client.
    let errorMessage = 'An internal server error occurred. Please check the function logs for details.';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as { message: string }).message);
    }

    // Check for common, user-fixable configuration issues and tailor the response.
    if (errorMessage.includes("No such price")) {
      errorMessage = "Invalid 'priceId' provided. Please ensure the Price ID in 'constants.ts' matches a valid Price ID in your Stripe account.";
    } else if (errorMessage.toLowerCase().includes("api key") || errorMessage.toLowerCase().includes("secret key")) {
      errorMessage = "Authentication error with a service provider (like Stripe or Supabase). Please double-check that your API keys are set correctly in your Supabase project secrets and that they are valid.";
    } else if (errorMessage.toLowerCase().includes("customer")) {
      errorMessage = `There was an issue retrieving or creating the customer record in Stripe. Details: ${errorMessage}`;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

// Start the server and pass the request to the main handler.
serve(handler);