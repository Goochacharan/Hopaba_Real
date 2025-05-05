import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0;
  }
  
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + 
             Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) {
    dist = 1;
  }
  
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515; // Distance in miles
  dist = dist * 1.609344;    // Convert to kilometers
  
  return Math.round(dist * 10) / 10; // Round to 1 decimal place
}

// Extract coordinates from a Google Maps link
function extractCoordinatesFromMapLink(mapLink: string | null): { lat: number, lng: number } | null {
  if (!mapLink) return null;
  
  try {
    // Match patterns like @12.9716,77.5946 or ?q=12.9716,77.5946
    const coordinatesRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = mapLink.match(coordinatesRegex);
    
    if (match) {
      // Check which pattern matched (@lat,lng or q=lat,lng)
      const lat = parseFloat(match[1] || match[3]);
      const lng = parseFloat(match[2] || match[4]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    console.log('Could not extract coordinates from map link:', mapLink);
    return null;
  } catch (error) {
    console.error('Error extracting coordinates from map link:', error);
    return null;
  }
}

// Extract potential tags from a search query
function extractTagsFromQuery(query: string): string[] {
  if (!query) return [];
  
  // Split the query into words
  const words = query.toLowerCase().split(/\s+/);
  
  // If we have multiple words, consider the full query as a potential tag too
  const potentialTags = [...words];
  if (words.length > 1) {
    potentialTags.push(query.toLowerCase());
  }
  
  return potentialTags;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { searchQuery, categoryFilter, userLat, userLng } = await req.json();
    
    console.log(`Processing search query: "${searchQuery}", category: "${categoryFilter}"`);
    
    // Extract potential tags from the search query for better matching
    const potentialTags = extractTagsFromQuery(searchQuery);
    console.log('Potential tags extracted from query:', potentialTags);
    
    // First attempt to use the RPC function for enhanced search
    const { data: enhancedProviders, error } = await supabase.rpc(
      'search_enhanced_providers',
      { search_query: searchQuery }
    );

    if (error) {
      console.error("Error using enhanced providers search:", error);
      throw error;
    }

    // Filter by category if needed
    let filteredProviders = enhancedProviders || [];
    if (categoryFilter && categoryFilter !== 'all') {
      const dbCategory = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
      filteredProviders = filteredProviders.filter((provider: any) => 
        provider.category.toLowerCase() === dbCategory.toLowerCase()
      );
      console.log(`Filtered to ${filteredProviders.length} providers in category ${dbCategory}`);
    }
    
    // Enhance tag matching
    filteredProviders = filteredProviders.map((provider: any) => {
      const tags = provider.tags || [];
      let hasTagMatch = false;
      let matchedTags: string[] = [];
      
      // Check if any potential tags match any provider tags
      for (const potentialTag of potentialTags) {
        for (const tag of tags) {
          const tagLower = tag.toLowerCase();
          const potentialTagLower = potentialTag.toLowerCase();
          
          if (tagLower.includes(potentialTagLower) || potentialTagLower.includes(tagLower)) {
            hasTagMatch = true;
            if (!matchedTags.includes(tag)) {
              matchedTags.push(tag);
            }
          }
        }
      }
      
      // Boost search rank for tag matches
      const boostAmount = hasTagMatch ? 5 : 0;
      
      return {
        ...provider,
        search_rank: (provider.search_rank || 0) + boostAmount,
        matchedTags: matchedTags,
        hasTagMatch: hasTagMatch
      };
    });
    
    console.log(`Found ${filteredProviders.filter((p: any) => p.hasTagMatch).length} providers with tag matches`);
    
    // Sort providers with tag matches first, then by search rank
    filteredProviders.sort((a: any, b: any) => {
      // Tag matches get first priority
      if (a.hasTagMatch && !b.hasTagMatch) return -1;
      if (!a.hasTagMatch && b.hasTagMatch) return 1;
      
      // Then sort by search rank
      return b.search_rank - a.search_rank;
    });
    
    // If user location is provided, calculate distances and sort
    if (userLat && userLng) {
      filteredProviders = filteredProviders.map((provider: any) => {
        // Extract coordinates from map_link
        const coordinates = extractCoordinatesFromMapLink(provider.map_link);
        let distance = null;
        
        if (coordinates) {
          distance = calculateDistance(
            userLat,
            userLng,
            coordinates.lat,
            coordinates.lng
          );
        }
        
        return {
          ...provider,
          calculatedDistance: distance,
          distance: distance !== null ? `${distance.toFixed(1)} km away` : null
        };
      });
      
      // Sort providers respecting tag matches first
      filteredProviders.sort((a: any, b: any) => {
        // Tag matches still get priority
        if (a.hasTagMatch && !b.hasTagMatch) return -1;
        if (!a.hasTagMatch && b.hasTagMatch) return 1;
        
        // Among tag matches, sort by distance if available
        if (a.hasTagMatch && b.hasTagMatch) {
          if (a.calculatedDistance !== null && b.calculatedDistance !== null) {
            return a.calculatedDistance - b.calculatedDistance;
          }
        }
        
        // For non-tag matches, default to distance
        if (a.calculatedDistance !== null && b.calculatedDistance !== null) {
          return a.calculatedDistance - b.calculatedDistance;
        }
        
        // If only one has distance, prioritize the one with distance
        if (a.calculatedDistance !== null) return -1;
        if (b.calculatedDistance !== null) return 1;
        
        // Otherwise sort by search rank
        return b.search_rank - a.search_rank;
      });
    }
    
    return new Response(
      JSON.stringify({ 
        providers: filteredProviders,
        userLocation: userLat && userLng ? { lat: userLat, lng: userLng } : null
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in search function:', error);
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
