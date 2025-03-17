
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    const { query, context } = await req.json();
    
    console.log('Enhancing search query:', query);
    console.log('With context:', context ? 'Provided' : 'None');

    // DeepSeek API endpoint
    const url = 'https://api.deepseek.com/v1/chat/completions';

    // Prepare context for in-context learning
    const systemPrompt = `You are an AI assistant that enhances search queries for a local business discovery platform.
Your task is to improve the search query by:
1. Identifying intent (looking for restaurants, services, specific locations)
2. Expanding on abbreviated or incomplete queries
3. Normalizing location references
4. Adding relevant context that might be missing
5. Return ONLY the enhanced search query. Do not add any explanation or additional text.`;

    // Create messages with context if provided
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Original search query: "${query}"${context ? `\nContext: ${context}` : ''}` }
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",  // Using DeepSeek's chat model
        messages: messages,
        temperature: 0.3,  // Lower temperature for more focused results
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('DeepSeek response:', data);
    
    // Extract the enhanced query from the response
    const enhancedQuery = data.choices[0].message.content.trim();
    
    return new Response(
      JSON.stringify({ 
        original: query,
        enhanced: enhancedQuery,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in enhance-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
