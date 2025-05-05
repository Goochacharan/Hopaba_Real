
import { supabase } from '@/integrations/supabase/client';
import { Event, SupabaseEvent } from '@/hooks/types/recommendationTypes';
import { toast } from '@/components/ui/use-toast';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import { containsWordOrPhrase, extractTagsFromQuery } from '@/utils/queryUtils';

export const fetchServiceProviders = async (searchTerm: string, categoryFilter: string) => {
  try {
    console.log(`Fetching service providers with search term: "${searchTerm}" and category: "${categoryFilter}"`);
    
    if (searchTerm && searchTerm.trim() !== '') {
      try {
        // Extract potential tags from the search query
        const searchTermTags = extractTagsFromQuery(searchTerm);
        console.log('Extracted potential tags from search term:', searchTermTags);
        
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
        
        // Add additional tag matching logic
        if (searchTermTags.length > 0 && filteredProviders.length === 0) {
          console.log('No results from direct query, trying tag matching...');
          
          // Try to fetch more results with a broader query
          const { data: allProviders } = await supabase
            .from('service_providers')
            .select('*')
            .eq('approval_status', 'approved');
            
          if (allProviders && allProviders.length > 0) {
            filteredProviders = allProviders.filter(provider => {
              // Check if any tag matches any of the extracted tag phrases
              if (provider.tags && Array.isArray(provider.tags)) {
                for (const tag of provider.tags) {
                  for (const searchTag of searchTermTags) {
                    if (containsWordOrPhrase(tag, searchTag) || containsWordOrPhrase(searchTag, tag)) {
                      console.log(`Tag match found: "${tag}" matches with "${searchTag}" for ${provider.name}`);
                      return true;
                    }
                  }
                }
              }
              
              // Check name and description for tag matches
              for (const searchTag of searchTermTags) {
                if (containsWordOrPhrase(provider.name, searchTag) || 
                    (provider.description && containsWordOrPhrase(provider.description, searchTag))) {
                  console.log(`Name/description match found with tag "${searchTag}" for ${provider.name}`);
                  return true;
                }
              }
              
              return false;
            });
          }
        }
        
        if (categoryFilter !== 'all') {
          const dbCategory = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
          filteredProviders = filteredProviders.filter(provider => 
            provider.category.toLowerCase() === dbCategory.toLowerCase()
          );
          console.log(`Filtered to ${filteredProviders.length} providers after category filter: ${dbCategory}`);
        }
        
        return filteredProviders.map(item => {
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
            search_rank: item.search_rank || 0,
            latitude: coordinates ? coordinates.lat : null,
            longitude: coordinates ? coordinates.lng : null
          };
        });
      } catch (err) {
        console.error("Failed to use enhanced providers search:", err);
        return [];
      }
    }
    
    // If there's no search term, or the previous search failed, fallback to regular search
    let query = supabase
      .from('service_providers')
      .select('*')
      .eq('approval_status', 'approved');
    
    if (categoryFilter !== 'all') {
      const dbCategory = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
      query = query.eq('category', dbCategory);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
      const words = searchTerm.trim().toLowerCase().split(/\s+/);
      
      if (words.length > 1) {
        // For multi-word queries, try to match individual words
        for (const word of words) {
          if (word.length > 2) { // Skip very short words
            query = query.or(`name.ilike.%${word}%,description.ilike.%${word}%,tags.cs.{${word}}`);
          }
        }
      } else {
        // For single word queries, use the full query
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
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
      const words = searchTerm.trim().toLowerCase().split(/\s+/);
      
      if (words.length > 1) {
        // For multi-word queries, try to match individual words
        for (const word of words) {
          if (word.length > 2) { // Skip very short words
            query = query.or(`title.ilike.%${word}%,description.ilike.%${word}%,location.ilike.%${word}%`);
          }
        }
      } else {
        // For single word queries, use the full query
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }
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
