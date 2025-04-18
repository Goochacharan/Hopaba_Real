import { useState, useEffect } from 'react';
import { Recommendation } from '@/lib/mockData';
import { CategoryType } from '@/components/CategoryFilter';
import { supabase } from '@/integrations/supabase/client';

interface UseRecommendationsProps {
  initialQuery?: string;
  initialCategory?: CategoryType;
  loadDefaultResults?: boolean;
}

interface FilterOptions {
  maxDistance: number;
  minRating: number;
  priceLevel: number;
  openNow: boolean;
  hiddenGem?: boolean;
  mustVisit?: boolean;
  distanceUnit?: 'km' | 'mi';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  attendees: number;
  pricePerPerson?: number;
  phoneNumber?: string;
  whatsappNumber?: string;
  images?: string[];
  approval_status?: string;
  user_id?: string;
  isHiddenGem?: boolean;
  isMustVisit?: boolean;
}

const useRecommendations = ({ 
  initialQuery = '', 
  initialCategory = 'all',
  loadDefaultResults = false
}: UseRecommendationsProps = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const processNaturalLanguageQuery = (rawQuery: string) => {
    const lowercaseQuery = rawQuery.toLowerCase();
    let processedQuery = lowercaseQuery;
    let inferredCategory: CategoryType = category === 'all' ? 'all' : category;
    
    console.log('Original query:', `"${lowercaseQuery}"`);
    
    if (inferredCategory !== 'all') {
      console.log(`Using provided category: ${inferredCategory}`);
    } 
    else {
      if (lowercaseQuery.includes('yoga')) {
        inferredCategory = 'fitness';
      } else if (lowercaseQuery.includes('restaurant')) {
        inferredCategory = 'restaurants';
      } else if (lowercaseQuery.includes('café') || lowercaseQuery.includes('cafe') || lowercaseQuery.includes('coffee')) {
        inferredCategory = 'cafes';
      } else if (lowercaseQuery.includes('salon') || lowercaseQuery.includes('haircut')) {
        inferredCategory = 'salons';
      } else if (lowercaseQuery.includes('plumber')) {
        inferredCategory = 'services';
      } else if (lowercaseQuery.includes('fitness') || lowercaseQuery.includes('gym')) {
        inferredCategory = 'fitness';
      } else if (lowercaseQuery.includes('biryani') || 
                 lowercaseQuery.includes('food') || 
                 lowercaseQuery.includes('dinner') || 
                 lowercaseQuery.includes('lunch') ||
                 lowercaseQuery.includes('breakfast')) {
        inferredCategory = 'restaurants';
      }
    }
    
    if (inferredCategory !== 'all' && inferredCategory !== category) {
      console.log(`Setting category state to: ${inferredCategory}`);
      setCategory(inferredCategory);
    }
    
    return { processedQuery, inferredCategory };
  };

  const fetchServiceProviders = async (searchTerm: string, categoryFilter: string) => {
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
            rating: 4.5, // Default rating
            address: `${item.area}, ${item.city}`,
            distance: "0.5 miles away",
            image: item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
            images: item.images || [],
            description: item.description || "",
            phone: item.contact_phone,
            openNow: false, // Default value
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
          rating: 4.5, // Default rating
          address: `${item.area}, ${item.city}`,
          distance: "0.5 miles away",
          image: item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
          images: item.images || [],
          description: item.description || "",
          phone: item.contact_phone,
          openNow: false, // Default value
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
  
  const fetchEvents = async (searchTerm: string) => {
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

  const filterRecommendations = (
    recs: Recommendation[],
    filterOptions: FilterOptions
  ): Recommendation[] => {
    const { distanceUnit = 'mi' } = filterOptions;
    
    return recs.filter(rec => {
      if (rec.rating < filterOptions.minRating) {
        return false;
      }

      if (filterOptions.openNow && !rec.openNow) {
        return false;
      }

      if (filterOptions.hiddenGem && !rec.isHiddenGem) {
        return false;
      }

      if (filterOptions.mustVisit && !rec.isMustVisit) {
        return false;
      }

      if (rec.distance) {
        const distanceValue = parseFloat(rec.distance.split(' ')[0]);
        if (!isNaN(distanceValue)) {
          const adjustedDistance = distanceUnit === 'km' ? distanceValue : distanceValue * 1.60934;
          if (adjustedDistance > filterOptions.maxDistance) {
            return false;
          }
        }
      }

      if (rec.priceLevel) {
        const priceCount = rec.priceLevel.length;
        if (priceCount > filterOptions.priceLevel) {
          return false;
        }
      }

      return true;
    });
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleCategoryChange = (newCategory: CategoryType) => {
    setCategory(newCategory);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (query) {
          const { processedQuery, inferredCategory } = processNaturalLanguageQuery(query);
          const effectiveCategory = inferredCategory;
          const serviceProviders = await fetchServiceProviders(processedQuery, effectiveCategory);
          setRecommendations(serviceProviders);
          const eventsData = await fetchEvents(processedQuery);
          setEvents(eventsData);
        } 
        else if (loadDefaultResults) {
          const serviceProviders = await fetchServiceProviders('', category);
          setRecommendations(serviceProviders);
          const eventsData = await fetchEvents('');
          setEvents(eventsData);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [query, category, loadDefaultResults]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    recommendations,
    events,
    loading,
    error,
    filterRecommendations,
    handleSearch,
    handleCategoryChange
  };
};

export default useRecommendations;
