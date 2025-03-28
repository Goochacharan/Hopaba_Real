
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const WHATSAPP_API_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN') || '';
const WHATSAPP_VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || '';
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to send a WhatsApp message
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

// Function to query recommendations from the database
async function getRecommendations(query: string) {
  try {
    // First, use OpenAI to extract key search terms and categories
    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
            You are a search query optimizer. Extract search terms and categories from the user's query.
            Return a JSON object with the following structure:
            {
              "searchTerm": "extracted main search term",
              "category": "one of: restaurants, cafes, salons, services, health, shopping, education, fitness, or all if none specified",
              "attributes": ["any specific attributes mentioned like veg, non-veg, cheap, expensive, etc"]
            }
            `
          },
          { role: 'user', content: query }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });
    
    const extractionData = await extractionResponse.json();
    const extraction = JSON.parse(extractionData.choices[0].message.content);
    
    console.log('Extracted search parameters:', extraction);
    
    // Search recommendations based on extracted terms
    const { data: recommendationsData, error } = await supabase.rpc(
      'search_recommendations', 
      { 
        search_query: extraction.searchTerm,
        category_filter: extraction.category === 'all' ? 'all' : extraction.category
      }
    );
    
    if (error) {
      console.error('Supabase search error:', error);
      return 'Sorry, I encountered an error when searching for recommendations. Please try again later.';
    }
    
    // If no results, search more broadly
    if (!recommendationsData || recommendationsData.length === 0) {
      const { data: broadResults } = await supabase
        .from('recommendations')
        .select('*')
        .order('rating', { ascending: false })
        .limit(3);
        
      if (broadResults && broadResults.length > 0) {
        return formatRecommendations(broadResults, query);
      }
      
      return 'I couldn\'t find any places matching your request. Maybe try a different search term?';
    }
    
    return formatRecommendations(recommendationsData, query);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return 'Sorry, I encountered an error when searching for recommendations. Please try again later.';
  }
}

// Function to format recommendations into a natural language response
async function formatRecommendations(recommendations: any[], originalQuery: string) {
  try {
    // Take top 3 recommendations
    const topRecs = recommendations.slice(0, 3);
    
    const recDetails = topRecs.map(rec => ({
      name: rec.name,
      category: rec.category,
      rating: rec.rating,
      address: rec.address,
      description: rec.description?.slice(0, 100) + '...',
      phone: rec.phone,
      link: `${Deno.env.get('APP_URL') || 'https://your-app-url.com'}/location/${rec.id}`
    }));
    
    // Use OpenAI to format a natural language response
    const formatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
            You are a helpful local recommendation assistant. Format the provided recommendations into a natural, 
            conversational response that directly answers the user's query. Include the name, short description, 
            rating, and link for each recommendation. Keep the total response under 1000 characters and make it 
            sound friendly and helpful. Don't mention that you're an AI.
            `
          },
          {
            role: 'user', 
            content: `User asked: "${originalQuery}"\n\nRecommendations: ${JSON.stringify(recDetails)}`
          }
        ],
        temperature: 0.7,
      }),
    });
    
    const formatData = await formatResponse.json();
    return formatData.choices[0].message.content;
  } catch (error) {
    console.error('Error formatting recommendations:', error);
    
    // Fallback to simple formatting if OpenAI fails
    const simpleResponse = recommendations.slice(0, 3).map(rec => 
      `• ${rec.name} (${rec.rating}★): ${rec.description?.slice(0, 80)}... ${Deno.env.get('APP_URL') || 'https://your-app-url.com'}/location/${rec.id}`
    ).join('\n\n');
    
    return `Here are some recommendations for "${originalQuery}":\n\n${simpleResponse}`;
  }
}

// Process incoming WhatsApp messages
async function processWhatsAppMessage(phoneNumber: string, message: string) {
  console.log(`Processing message from ${phoneNumber}: ${message}`);
  
  // Get recommendations based on the message
  const recommendationsText = await getRecommendations(message);
  
  // Send the recommendations back via WhatsApp
  await sendWhatsAppMessage(phoneNumber, recommendationsText);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  
  // WhatsApp webhook verification
  if (req.method === 'GET' && url.pathname === '/whatsapp-recommendations') {
    const hubMode = url.searchParams.get('hub.mode');
    const hubVerifyToken = url.searchParams.get('hub.verify_token');
    const hubChallenge = url.searchParams.get('hub.challenge');
    
    if (hubMode === 'subscribe' && hubVerifyToken === WHATSAPP_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified');
      return new Response(hubChallenge, { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }
    
    return new Response('Verification failed', { 
      status: 403, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
  
  // WhatsApp message webhook processing
  if (req.method === 'POST' && url.pathname === '/whatsapp-recommendations') {
    try {
      const data = await req.json();
      console.log('Received webhook data:', JSON.stringify(data));
      
      // Extract the message and phone number
      if (data.object === 'whatsapp_business_account') {
        const entry = data.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        
        if (value?.messages && value.messages.length > 0) {
          const message = value.messages[0];
          
          if (message.type === 'text') {
            const phoneNumber = message.from;
            const messageText = message.text.body;
            
            // Process the message asynchronously
            // We don't await this to respond to WhatsApp quickly
            EdgeRuntime.waitUntil(processWhatsAppMessage(phoneNumber, messageText));
            
            // Return a 200 OK immediately to acknowledge receipt
            return new Response(JSON.stringify({ status: 'processing' }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }
      }
      
      return new Response(JSON.stringify({ status: 'no_message_to_process' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Test endpoint for debugging
  if (req.method === 'POST' && url.pathname === '/test-recommendation') {
    try {
      const { query, phone } = await req.json();
      
      if (!query) {
        return new Response(JSON.stringify({ error: 'Query is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const recommendations = await getRecommendations(query);
      
      // If phone is provided, send recommendations via WhatsApp
      if (phone) {
        await sendWhatsAppMessage(phone, recommendations);
      }
      
      return new Response(JSON.stringify({ recommendations }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error in test endpoint:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
