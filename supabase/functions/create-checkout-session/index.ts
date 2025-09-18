// supabase/functions/create-checkout-session/index.ts

// This function is deprecated. The active function is located in the 'create-checkout' directory.
// This file is kept to avoid breaking changes if old references still exist, but it will return an error.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.error("DEPRECATED FUNCTION CALLED: 'create-checkout-session' was invoked. Please use 'create-checkout' instead.");
  
    const errorPayload = {
      error: "This function ('create-checkout-session') is deprecated and should not be used. Please update the client to call 'create-checkout' instead."
    };
  
    return new Response(JSON.stringify(errorPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 410, // 410 Gone
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});