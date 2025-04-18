
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    console.log("Attempting to retrieve Google Maps API key from environment variables")
    
    // Verify the exact name of the secret as configured in Supabase
    const apiKey = Deno.env.get('Google_map')
    
    if (!apiKey) {
      console.error("API key not found in environment variables. Secret name: 'Google_map'")
      return new Response(JSON.stringify({ 
        error: 'API key not found',
        message: 'Please ensure the Google_map secret is configured in Supabase'
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 404
      })
    }

    console.log("Successfully retrieved Google Maps API key")
    return new Response(JSON.stringify({ apiKey }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })
  } catch (error) {
    console.error("Error retrieving Google Maps API key:", error.message)
    return new Response(JSON.stringify({ 
      error: error.message,
      trace: error.stack
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 500
    })
  }
})
