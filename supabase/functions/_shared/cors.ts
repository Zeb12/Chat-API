// This file defines the Cross-Origin Resource Sharing (CORS) headers.
// It allows your web application (running on a different domain) to make requests
// to your Supabase Edge Functions. It's a security requirement for browsers.

// This is a more comprehensive list of headers to allow, which can resolve
// stubborn CORS preflight issues by permitting headers automatically added
// by browsers or client libraries.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, accept-encoding',
};