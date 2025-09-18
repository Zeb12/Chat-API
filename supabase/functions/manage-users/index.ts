// supabase/functions/manage-users/index.ts

// This function allows an admin to update the status of one or more users.
//
// Required Environment Variables:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY (for authenticating the calling user)
// - SUPABASE_SERVICE_ROLE_KEY (for performing admin actions)
//
// Deployment:
// supabase functions deploy manage-users

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    const { data: { user: callingUser }, error: userError } = await userSupabaseClient.auth.getUser();

    if (userError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed. Invalid or expired token.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Authorize: Check if the calling user has the 'Admin' role.
    if (callingUser.user_metadata?.role !== 'Admin') {
      return new Response(
        JSON.stringify({ error: 'Permission denied. You must be an admin to perform this action.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate the request payload.
    const { userIds, status } = await req.json();
    if (!Array.isArray(userIds) || !userIds.length || !['Active', 'Suspended'].includes(status)) {
      throw new Error("Invalid request body. 'userIds' (an array) and a valid 'status' ('Active' or 'Suspended') are required.");
    }
    
    // 4. Perform the updates using the admin client.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const updatePromises = userIds.map(async (userId) => {
        // Prevent admin from suspending their own account
        if (userId === callingUser.id) {
            console.warn(`Admin user ${callingUser.email} attempted to change their own status. Skipping.`);
            return null;
        }

        // Fetch existing metadata to preserve other fields.
        const { data: targetUserData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (fetchError) {
            console.error(`Failed to fetch user ${userId}:`, fetchError);
            return { userId, error: fetchError.message };
        }
        
        // FIX: Add optional chaining to prevent a crash if 'targetUserData.user' is null.
        // This is a critical safeguard against unexpected API responses that could
        // otherwise cause a TypeError and crash the function.
        const existingMetadata = targetUserData.user?.user_metadata || {};
        const updatedMetadata = { ...existingMetadata, status: status };

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: updatedMetadata }
        );
        
        if (updateError) {
            console.error(`Failed to update user ${userId}:`, updateError);
            return { userId, error: updateError.message };
        }

        return { userId, status: 'success' };
    });

    const results = await Promise.all(updatePromises);
    const errors = results.filter(r => r && r.status !== 'success');

    if (errors.length > 0) {
        throw new Error(`Completed with partial success. Failed to update ${errors.length} user(s).`);
    }

    // 5. Return a success response.
    return new Response(JSON.stringify({ success: true, message: `Successfully updated ${userIds.length} user(s) to '${status}'.` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in manage-users function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});