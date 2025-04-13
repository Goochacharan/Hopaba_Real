
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";

// Initialize environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize OpenAI client
const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Vector similarity function
function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}

// Function to generate embeddings using OpenAI
async function generateEmbedding(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

// Function to get combined business and review data
async function getBusinessDataWithReviews() {
  try {
    // First approach: Using a custom SQL query to join data
    const { data: combinedData, error } = await supabase.rpc('search_business_with_reviews');
    
    if (error) {
      console.error("Error fetching combined data:", error);
      // Fallback to manual join if RPC fails
      return await getBusinessDataWithReviewsFallback();
    }
    
    return combinedData || [];
  } catch (error) {
    console.error("Error in getBusinessDataWithReviews:", error);
    return await getBusinessDataWithReviewsFallback();
  }
}

// Fallback function if RPC doesn't work
async function getBusinessDataWithReviewsFallback() {
  try {
    // Get service providers (businesses)
    const { data: serviceProviders } = await supabase
      .from('service_providers')
      .select('*')
      .eq('approval_status', 'approved');
    
    // Get all recommendations
    const { data: recommendations } = await supabase
      .from('recommendations')
      .select('*');
      
    // Combine the data (this is a simplified example)
    const combinedData = [
      ...(serviceProviders || []).map(sp => ({
        id: sp.id,
        name: sp.name,
        category: sp.category,
        description: sp.description,
        address: sp.address,
        area: sp.area,
        city: sp.city,
        rating: 0, // Default rating
        reviews: [],
        tags: sp.tags || [],
        source: 'service_providers'
      })),
      ...(recommendations || []).map(rec => ({
        id: rec.id,
        name: rec.name,
        category: rec.category,
        description: rec.description,
        address: rec.address,
        area: rec.city, // Using city as area for recommendations
        city: rec.city,
        rating: rec.rating || 0,
        reviews: [],
        tags: rec.tags || [],
        source: 'recommendations'
      }))
    ];
    
    return combinedData;
  } catch (error) {
    console.error("Error in fallback data fetch:", error);
    return [];
  }
}

// Process a query against the business data
async function processBusinessQuery(query: string) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) {
      throw new Error("Failed to generate embedding for query");
    }
    
    // Get business data
    const businessData = await getBusinessDataWithReviews();
    
    // If no data, return early
    if (!businessData || businessData.length === 0) {
      return { results: [], message: "No business data available" };
    }
    
    // For each business, generate temporary embedding and compute similarity
    const enrichedData = await Promise.all(
      businessData.map(async (business) => {
        // Create a rich text representation of the business
        const businessText = `${business.name}. ${business.category}. ${business.description || ""}. ${business.area || ""} ${business.city || ""}. ${(business.tags || []).join(", ")}`;
        
        // Generate embedding
        const embedding = await generateEmbedding(businessText);
        if (!embedding) return { ...business, similarity: 0 };
        
        // Calculate similarity
        const similarity = cosineSimilarity(queryEmbedding, embedding);
        
        return {
          ...business,
          similarity
        };
      })
    );
    
    // Sort by similarity
    const results = enrichedData
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Get top 5 results
      
    // Extract location from query using a simple approach
    const locationMatch = query.match(/in\s+([a-zA-Z\s]+)(?:$|\W)/i);
    const location = locationMatch ? locationMatch[1].trim().toLowerCase() : null;
    
    // Filter by location if present in query
    const filteredResults = location 
      ? results.filter(item => 
          (item.area && item.area.toLowerCase().includes(location)) || 
          (item.city && item.city.toLowerCase().includes(location)))
      : results;
      
    // If no results after location filtering, return the original results
    const finalResults = filteredResults.length > 0 ? filteredResults : results;
    
    return { 
      results: finalResults,
      message: `Found ${finalResults.length} relevant results`
    };
  } catch (error) {
    console.error("Error processing business query:", error);
    return { 
      results: [], 
      error: error.message || "Error processing query" 
    };
  }
}

// Handler for serving the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Processing query: "${query}"`);
    const results = await processBusinessQuery(query);
    
    return new Response(
      JSON.stringify(results),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
