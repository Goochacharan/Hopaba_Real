
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
    // Retrieve the MapMyIndia API key from environment variables
    const apiKey = Deno.env.get('MAPMYINDIA_API_KEY')

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not found' }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 404
      })
    }

    return new Response(JSON.stringify({ apiKey }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 500
    })
  }
})
