// supabase/functions/update-user-role/index.ts

// Add a type declaration for the Deno global object to resolve potential linting errors.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle preflight CORS requests for browser security.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error("Server configuration error: Missing required environment variables.");
    }

    // 1. Authenticate the user making the request using their JWT.
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('Missing Authorization header. User must be logged in.');
    }

    const userSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } }
    });
    const { data: { user }, error: userError } = await userSupabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed. Invalid or expired token.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Authorize the action: Ensure the authenticated user has the 'Admin' role.
    if (user.user_metadata?.role !== 'Admin') {
      return new Response(
        JSON.stringify({ error: 'Permission denied. You must be an admin to perform this action.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate the request payload.
    const { userId, newRole } = await req.json();
    if (!userId || !newRole || !['User', 'Admin'].includes(newRole)) {
      throw new Error("Invalid request body. 'userId' and a valid 'newRole' ('User' or 'Admin') are required.");
    }

    // 4. Perform the update using the admin client with the service role key.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch existing metadata to preserve other fields like plan, status, etc.
    const { data: targetUserData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError) throw fetchError;
    
    const existingMetadata = targetUserData.user.user_metadata || {};
    const updatedMetadata = { ...existingMetadata, role: newRole };

    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: updatedMetadata }
    );

    if (updateError) throw updateError;

    // 5. Return a success response.
    return new Response(JSON.stringify({ success: true, user: data.user }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-user-role function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});