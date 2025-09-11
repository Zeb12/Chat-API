// supabase/functions/generate-chatbot-script/index.ts

// Add a type declaration for the Deno global object to resolve potential linting errors.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@^1.17.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle preflight CORS requests for browser security.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // FIX: Move Gemini client initialization inside the request handler.
    // This prevents the entire function from crashing on startup if the API key
    // is missing, which is a common cause of CORS preflight failures.
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error("The server is not configured for AI script generation. Missing GEMINI_API_KEY environment variable.");
    }
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const { config } = await req.json();
    if (!config) {
      throw new Error("Missing 'config' in request body.");
    }
    
    const { businessInfo, personality, faqs } = config;

    // Construct a detailed system instruction for the AI model.
    const systemInstruction = `
You are an expert JavaScript developer specializing in creating embeddable web widgets.
Your task is to generate a single, self-contained JavaScript file. 
This script will be embedded on a user's website to add a chatbot widget.

**Requirements for the generated script:**
1.  **Self-Contained:** The script must not have any external dependencies (no imports, no external libraries like React, Vue, etc.). It should contain all necessary HTML, CSS, and JavaScript.
2.  **Widget UI:**
    *   It must create a floating circular button (chat launcher) fixed to the bottom-right of the screen.
    *   Clicking the launcher opens a chat window.
    *   The chat window should have a header, a message area, and a text input for the user.
    *   The UI should be clean, modern, and responsive.
3.  **Chat Logic:**
    *   The chatbot's personality and knowledge are defined by the provided JSON.
    *   When a user sends a message, the chatbot should provide a relevant answer.
    *   The chatbot should first try to find an exact or very similar match in the FAQs.
    *   If no FAQ matches, it should use the business information to formulate a helpful, general response.
    *   If it cannot answer, it should state its limitations politely.
4.  **Code Style:** The generated code must be well-formatted, commented, and enclosed within a single Immediately Invoked Function Expression (IIFE) to avoid polluting the global scope of the host website.
5.  **Output Format:** Your ENTIRE response must be ONLY the raw JavaScript code. Do not wrap it in markdown backticks (\`\`\`javascript) or any other text.
`;

    // Construct the user prompt with the specific chatbot configuration.
    const userPrompt = `
Generate the chatbot script based on this configuration:

**Personality:** ${personality}

**Business Information:**
- Name: ${businessInfo.name}
- Description: ${businessInfo.description}
- Website: ${businessInfo.website}

**Frequently Asked Questions:**
${faqs.map((faq: {question: string, answer: string}) => `- Q: ${faq.question}\n  A: ${faq.answer}`).join('\n')}

Please now generate the complete, raw JavaScript code for the chatbot widget as instructed.
`;

    // Call the Gemini API to generate the script.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2, // Lower temperature for more predictable and stable code generation.
        }
    });
    
    const script = response.text;

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-chatbot-script function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
