// supabase/functions/generate-story/index.ts

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@^1.17.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error("Server not configured: Missing GEMINI_API_KEY.");
    }
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const { prompt, style } = await req.json();
    if (!prompt || !style) {
      throw new Error("Missing 'prompt' or 'style' in request body.");
    }

    // Use Promise.all to run both API calls in parallel
    const [storyResponse, imageResponse] = await Promise.all([
        // Story generation
        ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, imaginative, one-paragraph children's story about: "${prompt}". Keep it under 100 words.`,
            config: { temperature: 0.8 }
        }),
        // Image generation
        ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A beautiful, whimsical, children's storybook illustration of: "${prompt}". Style: ${style}, vibrant colors, simple shapes.`,
            config: { 
                numberOfImages: 1,
                outputMimeType: 'image/png'
            }
        })
    ]);

    const story = storyResponse.text;
    
    // CRITICAL FIX: Safely access the generated image data.
    // This prevents a server crash if the image generation API returns a successful
    // response but with an empty `generatedImages` array, which can happen if
    // the prompt is flagged by safety filters.
    const generatedImage = imageResponse.generatedImages?.[0];
    if (!generatedImage || !generatedImage.image?.imageBytes) {
        throw new Error("Image generation was successful but returned no image data. The prompt may have been blocked by safety filters. Please try a different prompt.");
    }
    
    const base64ImageBytes = generatedImage.image.imageBytes;
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;

    return new Response(JSON.stringify({ story, imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-story function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});