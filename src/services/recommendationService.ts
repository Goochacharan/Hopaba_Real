
import { supabase } from '@/integrations/supabase/client';
import { Event, SupabaseEvent } from '@/hooks/types/recommendationTypes';
import { toast } from '@/components/ui/use-toast';

export const fetchServiceProviders = async (searchTerm: string, categoryFilter: string) => {
  try {
    console.log(`Fetching service providers with search term: "${searchTerm}" and category: "${categoryFilter}"`);
    
    if (searchTerm && searchTerm.trim() !== '') {
      try {
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
        
        return filteredProviders.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          tags: item.tags || [],
          rating: 4.5,
          address: `${item.area}, ${item.city}`,
          distance: "0.5 miles away",
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
          search_rank: item.search_rank || 0
        }));
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
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching from Supabase:", error);
      return [];
    }
    
    console.log(`Fetched ${data?.length || 0} service providers from Supabase`);
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        tags: item.tags || [],
        rating: 4.5,
        address: `${item.area}, ${item.city}`,
        distance: "0.5 miles away",
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
        created_at: item.created_at || new Date().toISOString()
      }));
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
