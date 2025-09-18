// supabase/functions/generate-chatbot-script/index.ts

// Add a type declaration for the Deno global object to resolve potential linting errors.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@^1.17.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import { corsHeaders } from '../_shared/cors.ts';

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
    
    const { config } = await req.json();
    if (!config || typeof config !== 'object') {
      throw new Error("Missing or invalid 'config' object in request body.");
    }
    
    // 3. Add robust validation for the config object's properties
    const { businessInfo, personality, faqs, appearance } = config;

    if (!businessInfo || typeof businessInfo !== 'object') {
        throw new Error("Config validation failed: 'businessInfo' must be an object.");
    }
    if (!personality || typeof personality !== 'string') {
        throw new Error("Config validation failed: 'personality' must be a string.");
    }
    if (!Array.isArray(faqs)) { // This is the critical check
        throw new Error("Config validation failed: 'faqs' must be an array.");
    }
    if (!appearance || typeof appearance !== 'object' || !appearance.colors) {
        throw new Error("Config validation failed: 'appearance' must be an object with a 'colors' property.");
    }

    // Construct a detailed system instruction for the AI model.
    const systemInstruction = `
You are an expert JavaScript developer specializing in creating embeddable web widgets.
Your task is to generate a single, self-contained JavaScript file.
This script will be embedded on a user's website to add a chatbot widget.

**Requirements for the generated script:**
1.  **Self-Contained:** The script must not have any external dependencies (no imports, no external libraries like React, Vue, etc.). It must contain all necessary HTML, CSS, and JavaScript, enclosed within a single Immediately Invoked Function Expression (IIFE) to avoid polluting the global scope.
2.  **Customization via CSS Variables:** This is critical. You MUST use CSS custom properties (variables) for all themeable elements. Define these variables in a \`:root\` selector scoped to the widget's container to avoid affecting the host page.
3.  **Widget UI:**
    *   Create a floating circular chat launcher button fixed to the bottom-right.
    *   Clicking the launcher opens a chat window.
    *   The chat window must have a header displaying the business name and the provided logo.
    *   The UI must be clean, modern, and responsive.
4.  **Applying Styles:**
    *   **Colors:** Use the provided primary, bot message, and text colors via the CSS variables.
    *   **Font:** Apply the specified font family to all text in the widget. If it is a known Google Font (like Roboto, Poppins, etc.), you MUST include the necessary \`@import\` statement for the font at the top of the CSS styles.
    *   **Logo:** The logo is provided as a Base64 data URL. Embed it directly as the \`src\` of an \`<img>\` tag in the chat header. If no logo is provided, the header should just contain the business name.
5.  **Chat Logic:** The chatbot should use the provided personality, business info, and FAQs to answer user questions. When it cannot find a relevant answer, it should state its limitations politely.
6.  **Output Format:** Your ENTIRE response must be ONLY the raw JavaScript code. Do not wrap it in markdown backticks (\`\`\`javascript) or any other text.
`;

    // Construct the user prompt with the specific chatbot configuration.
    const userPrompt = `
Generate the chatbot script based on this configuration:

**Personality:** ${personality}

**Business Information:**
- Name: ${businessInfo.name}
- Description: ${businessInfo.description}
- Website: ${businessInfo.website}

**Appearance Customization:**
- Primary Color: ${appearance.colors.primary}
- Bot Message Background Color: ${appearance.colors.botMessage}
- Text Color: ${appearance.colors.text}
- Font Family: '${appearance.fontFamily}', sans-serif
- Logo Data URL: ${appearance.logo ? appearance.logo : 'none'}

**Frequently Asked Questions:**
${faqs.map((faq: {question: string, answer: string}) => `- Q: ${faq.question}\n  A: ${faq.answer}`).join('\n')}

Please now generate the complete, raw JavaScript code for the chatbot widget as instructed. Ensure the generated code correctly implements all appearance customizations using CSS variables and embeds the logo if provided.
`;

    // 4. Call the Gemini API to generate the script.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2, // Lower temperature for more predictable and stable code generation.
        }
    });
    
    const script = response.text;

    if (!script || script.trim() === '') {
        throw new Error("The AI model returned an empty script. This can happen if the content of your business description or FAQs triggers the model's safety filters. Please try editing the chatbot's configuration and generating the script again.");
    }

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-chatbot-script function:", error);
    return new Response(JSON.stringify({ error: `AI Script Generation Failed: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
