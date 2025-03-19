
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    // Get query from request
    const { query } = await req.json();
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!query || typeof query !== 'string' || query.trim() === '') {
      // Return popular or preset suggestions when no query is provided
      const { data: recommendations, error: recError } = await supabase
        .from('recommendations')
        .select('name, category')
        .order('rating', { ascending: false })
        .limit(5);

      if (recError) {
        console.error('Error fetching default recommendations:', recError);
        throw new Error('Failed to fetch default suggestions');
      }

      // Extract unique categories and names
      const categories = [...new Set(recommendations?.map(r => r.category) || [])];
      const defaultSuggestions = [
        { suggestion: 'Best restaurants in Bangalore', category: 'Restaurants', source: 'default' },
        { suggestion: 'Yoga classes near me', category: 'Fitness', source: 'default' },
        { suggestion: 'Haircut salons in Indiranagar', category: 'Salons', source: 'default' },
        ...(categories || []).map(category => ({ 
          suggestion: `Top rated ${category.toLowerCase()}`, 
          category, 
          source: 'category' 
        })),
        ...(recommendations || []).slice(0, 3).map(rec => ({
          suggestion: rec.name,
          category: rec.category,
          source: 'place'
        }))
      ];

      return new Response(JSON.stringify({ suggestions: defaultSuggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Searching for suggestions with query:', query);

    // Try direct search from recommendations table first
    const { data: directResults, error: directError } = await supabase
      .from('recommendations')
      .select('name, category, tags')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5);

    if (directError) {
      console.error('Error with direct search:', directError);
    }

    let generatedSuggestions = [
      { suggestion: `${query} restaurants in Bangalore`, category: 'Restaurants', source: 'search' },
      { suggestion: `Best ${query} places near me`, category: 'Places', source: 'search' },
      { suggestion: `${query} in Indiranagar`, category: 'Location', source: 'search' },
      { suggestion: `Top rated ${query}`, category: 'Rating', source: 'search' }
    ];

    // If we have direct results, add them as top suggestions
    if (directResults && directResults.length > 0) {
      const directSuggestions = directResults.map(item => ({
        suggestion: item.name,
        category: item.category,
        source: 'place'
      }));
      
      // Combine direct results with generated suggestions
      generatedSuggestions = [...directSuggestions, ...generatedSuggestions];
    }

    // Try to fetch from search_suggestions function if available
    try {
      const { data, error } = await supabase
        .rpc('search_suggestions', { search_term: query });

      if (error) {
        console.error('Error from search_suggestions RPC:', error);
        // Return our generated suggestions instead of failing
        return new Response(JSON.stringify({ suggestions: generatedSuggestions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (data && data.length > 0) {
        // Enhance the suggestions with better formatting
        const enhancedSuggestions = data.map(item => {
          let suggestion = item.suggestion;
          
          // For categories, add "in" phrases
          if (item.source === 'category') {
            suggestion = `${item.category} in Bangalore`;
          }
          
          // For city suggestions, add relevant prefix
          if (item.source === 'city') {
            suggestion = `Places in ${item.suggestion}`;
          }
          
          return {
            ...item,
            suggestion
          };
        });

        console.log(`Found ${enhancedSuggestions.length} suggestions`);

        return new Response(JSON.stringify({ suggestions: enhancedSuggestions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // No database suggestions found, return generated ones
        return new Response(JSON.stringify({ suggestions: generatedSuggestions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (innerError) {
      console.error('Error in search_suggestions RPC call:', innerError);
      // Return generated suggestions instead of failing
      return new Response(JSON.stringify({ suggestions: generatedSuggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in search-suggestions function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch suggestions',
      suggestions: [
        { suggestion: 'Best restaurants in Bangalore', category: 'Restaurants', source: 'fallback' },
        { suggestion: 'Cafes near me', category: 'Cafes', source: 'fallback' },
        { suggestion: 'Plumbers in Koramangala', category: 'Services', source: 'fallback' }
      ] 
    }), {
      status: 200, // Return 200 with fallback suggestions instead of 500
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
