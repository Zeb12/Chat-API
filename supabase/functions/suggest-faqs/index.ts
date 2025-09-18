// supabase/functions/suggest-faqs/index.ts

// Add a type declaration for the Deno global object to resolve potential linting errors.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenAI, Type } from 'https://esm.sh/@google/genai@^1.17.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import { corsHeaders } from '../_shared/cors.ts';

// Define the expected JSON schema for the Gemini API response.
const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: 'A frequently asked question a customer might have, based on the website content.',
      },
      answer: {
        type: Type.STRING,
        description: 'A clear and concise answer to the question, summarized from the website content.',
      },
    },
    required: ['question', 'answer'],
  },
};

serve(async (req) => {
  // Handle preflight CORS requests for browser security.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Initialize environment variables and clients
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Server configuration error: Missing required environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    // 2. Authenticate the user making the request
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
        return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authorization } },
    });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return new Response(JSON.stringify({ error: `Authentication failed: ${userError?.message || 'No user found'}` }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const { url } = await req.json();
    if (!url) {
      throw new Error("Missing 'url' in request body.");
    }

    // 3. Fetch the HTML content from the provided URL with a timeout.
    let pageContent = '';
    try {
        const signal = AbortSignal.timeout(15000); 
        const response = await fetch(url, { signal });

        if (!response.ok) {
            throw new Error(`Failed to fetch the URL. Status: ${response.status} ${response.statusText}`);
        }
        pageContent = await response.text();
    } catch (fetchError) {
        console.error("Error fetching URL:", fetchError);
        if (fetchError.name === 'TimeoutError') {
            throw new Error(`The request to the website timed out after 15 seconds. The site might be slow, blocking requests, or temporarily unavailable.`);
        }
        throw new Error(`Could not retrieve content from the provided URL. Please ensure it is correct and publicly accessible. Details: ${fetchError.message}`);
    }

    const systemInstruction = `
You are an expert content analyst. Your task is to analyze the provided HTML content of a webpage and extract key information to generate a list of frequently asked questions (FAQs) that a customer might ask.

**Instructions:**
1.  **Parse Content:** Read through the HTML and identify the main textual content. Ignore boilerplate like navigation menus, footers, scripts, and styles.
2.  **Identify Key Topics:** Determine the primary topics discussed on the page (e.g., product features, services offered, company information, pricing, contact details, support policies).
3.  **Generate FAQs:** Based on these topics, create 3 to 5 relevant question-and-answer pairs.
    *   The **question** should be phrased from the perspective of a potential customer.
    *   The **answer** should be concise and directly extracted or summarized from the provided text.
4.  **Format Output:** You MUST return the data as a valid JSON array of objects, conforming to the specified schema.
`;
    
    const userPrompt = `
Please analyze the following HTML content and generate FAQ pairs.

HTML Content:
\`\`\`html
${pageContent}
\`\`\`
`;

    // 4. Call the Gemini API to generate the FAQs.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.3,
      },
    });

    // The response text should be a JSON string that can be parsed directly.
    const faqs = JSON.parse(response.text);

    return new Response(JSON.stringify({ faqs }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in suggest-faqs function:", error);
    // Ensure the error message sent to the client is helpful.
    const errorMessage = error.message.includes("deadline") 
      ? "The request timed out. The website may be too large or slow to process."
      : error.message;

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
