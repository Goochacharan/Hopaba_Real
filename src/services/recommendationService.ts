
import { supabase } from '@/integrations/supabase/client';
import { Event, SupabaseEvent } from '@/hooks/types/recommendationTypes';
import { toast } from '@/components/ui/use-toast';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import { extractTagsFromQuery } from '@/utils/queryUtils';
import { matchWordOrPhrase } from '@/utils/searchUtils';

export const fetchServiceProviders = async (searchTerm: string, categoryFilter: string) => {
  try {
    console.log(`Fetching service providers with search term: "${searchTerm}" and category: "${categoryFilter}"`);
    
    if (searchTerm && searchTerm.trim() !== '') {
      try {
        // First try to use the enhanced location-based search function if available
        try {
          const { data: locationSearchResult } = await supabase.functions.invoke(
            'enhanced-search-with-location', 
            {
              body: {
                searchQuery: searchTerm,
                categoryFilter
              }
            }
          );
          
          if (locationSearchResult?.providers && locationSearchResult.providers.length > 0) {
            console.log(`Fetched ${locationSearchResult.providers.length} providers from location-based search`);
            return locationSearchResult.providers;
          }
        } catch (locErr) {
          console.log('Location-based search failed, falling back to RPC function:', locErr);
        }
        
        // Extract potential tags from the search query for better matching
        const potentialTags = extractTagsFromQuery(searchTerm);
        console.log('Potential tags extracted from query:', potentialTags);
        
        const { data: enhancedProviders, error } = await supabase.rpc(
          'search_enhanced_providers', 
          { search_query: searchTerm }
        );

        if (error) {
          console.error("Error using enhanced providers search:", error);
          return [];
        }

        console.log(`Fetched ${enhancedProviders?.length || 0} enhanced service providers`);
        
        let filteredProviders = enhancedProviders || [];
        if (categoryFilter !== 'all') {
          const dbCategory = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
          filteredProviders = filteredProviders.filter(provider => 
            provider.category.toLowerCase() === dbCategory.toLowerCase()
          );
        }
        
        // Enhance the results by adding tag match information and adjusting ranks
        const providersWithTagInfo = filteredProviders.map(item => {
          // Check if any of the potential tags match any of the provider's tags
          const tags = item.tags || [];
          
          // Improved tag matching logic
          const tagMatches: string[] = [];
          let hasTagMatch = false;
          
          // Check each potential tag against provider tags
          for (const potentialTag of potentialTags) {
            // Direct tag matching
            const directMatch = tags.some(providerTag => 
              matchWordOrPhrase(providerTag, potentialTag)
            );
            
            // Check against name and description too for better semantic matches
            const nameMatch = matchWordOrPhrase(item.name, potentialTag);
            const descMatch = item.description ? matchWordOrPhrase(item.description, potentialTag) : false;
            
            if (directMatch || nameMatch || descMatch) {
              hasTagMatch = true;
              if (!tagMatches.includes(potentialTag)) {
                tagMatches.push(potentialTag);
              }
            }
          }
          
          // Log tag matching results for debugging
          if (hasTagMatch) {
            console.log(`Provider "${item.name}" matched tags: ${tagMatches.join(', ')}`);
          }
          
          // Extract coordinates from map_link if available
          const coordinates = extractCoordinatesFromMapLink(item.map_link);
          
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            tags: item.tags || [],
            tagMatches: tagMatches,
            rating: 4.5,
            address: `${item.area}, ${item.city}`,
            distance: "0.5 miles away", // This will be calculated based on user location later
            image: item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
            images: item.images || [],
            description: item.description || "",
            phone: item.contact_phone,
            openNow: false,
            hours: item.hours || "Until 8:00 PM",
            availability: item.availability || null,
            priceLevel: "$$",
            price_range_min: item.price_range_min || null,
            price_range_max: item.price_range_max || null,
            price_unit: item.price_unit || null,
            map_link: item.map_link || null,
            instagram: item.instagram || '',
            availability_days: item.availability_days || [],
            availability_start_time: item.availability_start_time || '',
            availability_end_time: item.availability_end_time || '',
            created_at: item.created_at || new Date().toISOString(),
            search_rank: hasTagMatch ? (item.search_rank || 0) + 5 : (item.search_rank || 0), // Boost rank for tag matches
            latitude: coordinates ? coordinates.lat : null,
            longitude: coordinates ? coordinates.lng : null,
            isTagMatch: hasTagMatch
          };
        });
        
        // Sort with tag matches first, then by search rank
        providersWithTagInfo.sort((a, b) => {
          // Tag matches get first priority
          if (a.isTagMatch && !b.isTagMatch) return -1;
          if (!a.isTagMatch && b.isTagMatch) return 1;
          
          // Then sort by search rank
          return (b.search_rank || 0) - (a.search_rank || 0);
        });
        
        return providersWithTagInfo;
      } catch (err) {
        console.error("Failed to use enhanced providers search:", err);
        return [];
      }
    }
    
    let query = supabase
      .from('service_providers')
      .select('*')
      .eq('approval_status', 'approved');
    
    if (categoryFilter !== 'all') {
      const dbCategory = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
      query = query.eq('category', dbCategory);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
      // Extract potential tags from the search query
      const potentialTags = extractTagsFromQuery(searchTerm);
      console.log('Potential tags for fallback search:', potentialTags);
      
      // Try to match against tags as well
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching from Supabase:", error);
      return [];
    }
    
    console.log(`Fetched ${data?.length || 0} service providers from Supabase`);
    
    if (data && data.length > 0) {
      return data.map(item => {
        // Extract coordinates from map_link if available
        const coordinates = extractCoordinatesFromMapLink(item.map_link);
        
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          tags: item.tags || [],
          rating: 4.5,
          address: `${item.area}, ${item.city}`,
          distance: "0.5 miles away", // This will be calculated based on user location later
          image: item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
          images: item.images || [],
          description: item.description || "",
          phone: item.contact_phone,
          openNow: false,
          hours: "Until 8:00 PM",
          availability: item.availability || null,
          priceLevel: "$$",
          price_range_min: item.price_range_min || null,
          price_range_max: item.price_range_max || null,
          price_unit: item.price_unit || null,
          map_link: item.map_link || null,
          instagram: item.instagram || '',
          availability_days: item.availability_days || [],
          availability_start_time: item.availability_start_time || '',
          availability_end_time: item.availability_end_time || '',
          created_at: item.created_at || new Date().toISOString(),
          latitude: coordinates ? coordinates.lat : null,
          longitude: coordinates ? coordinates.lng : null
        };
      });
    }
    
    return [];
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return [];
  }
};

export const fetchEvents = async (searchTerm: string): Promise<Event[]> => {
  try {
    console.log(`Fetching events with search term: "${searchTerm}"`);
    
    let query = supabase
      .from('events')
      .select('*')
      .eq('approval_status', 'approved');
    
    if (searchTerm && searchTerm.trim() !== '') {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching events from Supabase:", error);
      return [];
    }
    
    console.log(`Fetched ${data?.length || 0} events from Supabase`);
    
    if (data && data.length > 0) {
      return data.map(event => ({
        ...event,
        pricePerPerson: event.price_per_person || 0
      }));
    }
    
    return [];
  } catch (err) {
    console.error("Failed to fetch events from Supabase:", err);
    return [];
  }
};
