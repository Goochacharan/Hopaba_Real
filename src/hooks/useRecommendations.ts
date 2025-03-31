import { useState, useEffect } from 'react';
import { Recommendation } from '@/lib/mockData';
import { CategoryType } from '@/components/CategoryFilter';
import { supabase } from '@/integrations/supabase/client';

interface UseRecommendationsProps {
  initialQuery?: string;
  initialCategory?: CategoryType;
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
  initialCategory = 'all' 
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
        data.forEach(item => {
          console.log(`Service Provider ${item.name} - availability_days:`, item.availability_days);
          console.log(`Service Provider ${item.name} - availability:`, item.availability);
        });
        
        return data.map(item => {
          let availabilityDays = [];
          
          if (item.availability_days) {
            if (Array.isArray(item.availability_days)) {
              availabilityDays = item.availability_days;
            } else if (typeof item.availability_days === 'string') {
              try {
                if (item.availability_days.startsWith('[') && item.availability_days.endsWith(']')) {
                  availabilityDays = JSON.parse(item.availability_days);
                } else {
                  availabilityDays = item.availability_days.split(',').map(day => day.trim());
                }
              } catch (e) {
                console.error(`Failed to parse availability_days for ${item.name}:`, e);
                availabilityDays = [item.availability_days];
              }
            }
          }
          
          if (item.name === "Corner House Rajajinagar" && (!availabilityDays || availabilityDays.length === 0)) {
            availabilityDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
            console.log("Set default days for Corner House Rajajinagar:", availabilityDays);
          }
          
          let formattedAvailability = item.availability || null;
          
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            tags: item.tags || [],
            rating: item.rating || 4.5,
            address: `${item.area}, ${item.city}`,
            distance: "0.5 miles away",
            image: item.image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
            images: item.images || [],
            description: item.description || "",
            phone: item.contact_phone,
            openNow: item.open_now || false,
            hours: "Until 8:00 PM",
            availability: formattedAvailability,
            priceLevel: "$$",
            price_range_min: item.price_range_min || null,
            price_range_max: item.price_range_max || null,
            price_unit: item.price_unit || null,
            map_link: item.map_link || null,
            instagram: item.instagram || '',
            availability_days: availabilityDays,
            availability_start_time: item.availability_start_time || '',
            availability_end_time: item.availability_end_time || '',
            created_at: item.created_at || new Date().toISOString()
          };
        });
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
        const { processedQuery, inferredCategory } = processNaturalLanguageQuery(query);
        
        const effectiveCategory = inferredCategory;
        console.log("Effective search category:", effectiveCategory);
        
        const serviceProviders = await fetchServiceProviders(processedQuery, effectiveCategory);
        setRecommendations(serviceProviders);
        
        const eventsData = await fetchEvents(processedQuery);
        setEvents(eventsData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [query, category]);

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
