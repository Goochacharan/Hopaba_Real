
import { supabase } from '@/integrations/supabase/client';
import { Recommendation, AppEvent } from '@/types/recommendation';
import { yogaAndFitnessMockData, sampleEvents } from '@/data/yogaData';
import { mockRecommendations, searchRecommendations } from '@/lib/mockData';

export const fetchServiceProviders = async (searchTerm: string, categoryFilter: string): Promise<Recommendation[]> => {
  try {
    console.log("Searching service_providers for:", searchTerm);
    let query = supabase
      .from('service_providers')
      .select('*');
    
    if (categoryFilter !== 'all') {
      const dbCategory = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
      query = query.eq('category', dbCategory);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
      // Improved search query with more flexible matching
      query = query.or(
        `name.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `tags.cs.{"${searchTerm}"},` +
        `name.ilike.${searchTerm}%,` + // Start of name match
        `category.ilike.%${searchTerm}%` // Category contains search term
      );
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching from Supabase:", error);
      return [];
    }
    
    if (data && data.length > 0) {
      console.log("Found service providers:", data.length);
      return data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        tags: item.tags || [],
        rating: item.rating || 4.5,
        address: item.address,
        distance: item.distance || "0.5 miles away",
        image: item.image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
        images: item.images || [],
        description: item.description || "",
        phone: item.contact_phone,
        openNow: item.open_now || false,
        hours: item.hours || "Until 8:00 PM",
        priceLevel: item.price_range_min && item.price_range_max ? 
          (item.price_range_max > 2000 ? "$$$$" : 
          (item.price_range_max > 1000 ? "$$$" : 
          (item.price_range_max > 500 ? "$$" : "$"))) : "$$"
      })) as Recommendation[];
    }
    
    return [];
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return [];
  }
};

export const fetchRecommendationsFromSupabase = async (
  searchQuery: string, 
  categoryFilter: string
): Promise<Recommendation[]> => {
  try {
    console.log("Searching service_providers table for:", searchQuery);
    
    // Split the search query into words for better matching
    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    console.log("Search terms:", searchTerms);
    
    let query = supabase.from('service_providers').select('*');
    
    // Build a more comprehensive search query
    if (searchQuery && searchQuery.trim() !== '') {
      let searchConditions = [];
      
      // Add exact match condition
      searchConditions.push(`name.ilike.%${searchQuery}%`);
      searchConditions.push(`description.ilike.%${searchQuery}%`);
      
      // Add partial matches for each word in the search query
      searchTerms.forEach(term => {
        searchConditions.push(`name.ilike.%${term}%`);
        searchConditions.push(`category.ilike.%${term}%`);
        searchConditions.push(`description.ilike.%${term}%`);
        searchConditions.push(`tags.cs.{"${term}"}`);
      });
      
      // Combine all conditions with OR
      query = query.or(searchConditions.join(','));
    }
    
    if (categoryFilter !== 'all') {
      // Add category filter
      query = query.eq('category', categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1));
    }
    
    // Order by rating for better results
    query = query.order('rating', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching service_providers from Supabase:", error);
      return [];
    }
    
    console.log("Found service_providers:", data?.length || 0);
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        tags: item.tags || [],
        rating: item.rating || 4.5,
        address: item.address,
        distance: item.distance || "0.5 miles away",
        image: item.image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
        images: item.images || [item.image_url],
        description: item.description || "",
        phone: item.contact_phone,
        openNow: item.open_now || false,
        hours: item.hours || "Until 8:00 PM",
        priceLevel: item.price_range_min && item.price_range_max ? 
          (item.price_range_max > 2000 ? "$$$$" : 
          (item.price_range_max > 1000 ? "$$$" : 
          (item.price_range_max > 500 ? "$$" : "$"))) : "$$",
        reviewCount: item.review_count || 0
      })) as Recommendation[];
    }
    
    return [];
  } catch (err) {
    console.error("Failed to fetch service_providers from Supabase:", err);
    return [];
  }
};

export const fetchEventsFromSupabase = async (searchQuery: string): Promise<AppEvent[]> => {
  try {
    let query = supabase.from('events').select('*');
    
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching events from Supabase:", error);
      return [];
    }
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        title: item.title,
        date: item.date,
        time: item.time,
        location: item.location,
        description: item.description,
        image: item.image,
        attendees: item.attendees || 0
      }));
    }
    
    return [];
  } catch (err) {
    console.error("Failed to fetch events from Supabase:", err);
    return [];
  }
};

export const fetchDefaultRecommendations = async (): Promise<Recommendation[]> => {
  try {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .order('rating', { ascending: false })
      .limit(6);
      
    if (error) {
      console.error("Error fetching default results:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        tags: item.tags || [],
        rating: item.rating || 4.5,
        address: item.address,
        distance: item.distance || "0.5 miles away",
        image: item.image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
        images: item.images || [item.image_url],
        description: item.description || "",
        phone: item.contact_phone,
        openNow: item.open_now || false,
        hours: item.hours || "Until 8:00 PM",
        priceLevel: item.price_range_min && item.price_range_max ? 
          (item.price_range_max > 2000 ? "$$$$" : 
          (item.price_range_max > 1000 ? "$$$" : 
          (item.price_range_max > 500 ? "$$" : "$"))) : "$$",
        reviewCount: item.review_count || 0
      })) as Recommendation[];
    }
    
    return mockRecommendations.slice(0, 6) as unknown as Recommendation[];
  } catch (err) {
    console.error("Failed to fetch default recommendations:", err);
    return mockRecommendations.slice(0, 6) as unknown as Recommendation[];
  }
};

export const getYogaResults = (searchQuery: string): Recommendation[] => {
  console.log("Getting specialized yoga/fitness results");
  return yogaAndFitnessMockData.filter(studio => {
    if (searchQuery.includes('beginner') && studio.tags.includes('Beginners')) {
      return true;
    }
    return true;
  }) as Recommendation[];
};

export const searchEvents = (searchQuery: string): AppEvent[] => {
  const lowercaseQuery = searchQuery.toLowerCase();
  
  if (lowercaseQuery.includes('yoga')) {
    const yogaEvents = sampleEvents.filter(event => 
      event.title.toLowerCase().includes('yoga') || 
      event.description.toLowerCase().includes('yoga')
    );
    
    if (yogaEvents.length > 0) {
      return yogaEvents;
    }
  }
  
  return sampleEvents.filter(event => {
    return (
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.description.toLowerCase().includes(lowercaseQuery) ||
      event.location.toLowerCase().includes(lowercaseQuery)
    );
  });
};
